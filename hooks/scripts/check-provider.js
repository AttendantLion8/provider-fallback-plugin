#!/usr/bin/env node
/**
 * Session Start Hook - Check Provider Status & Refresh OAuth Tokens
 * Supports per-project configuration via .claude/provider-fallback.local.md
 */

const fs = require('fs');
const path = require('path');
const providers = require(path.join(__dirname, '..', '..', 'lib', 'providers.js'));
const auth = require(path.join(__dirname, '..', '..', 'lib', 'auth.js'));

/**
 * Parse YAML frontmatter from markdown file
 */
function parseLocalSettings(filePath) {
  if (!fs.existsSync(filePath)) return null;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Check for frontmatter
    if (lines[0] !== '---') return null;
    
    const endIdx = lines.findIndex((l, i) => i > 0 && l === '---');
    if (endIdx === -1) return null;
    
    const frontmatter = lines.slice(1, endIdx).join('\n');
    const settings = {};
    
    // Parse YAML-like frontmatter (simple key: value parsing)
    let currentKey = null;
    let inArray = false;
    let arrayItems = [];
    
    for (const line of frontmatter.split('\n')) {
      // Array item
      if (line.match(/^\s+-\s+/)) {
        if (inArray && currentKey) {
          const value = line.replace(/^\s+-\s+/, '').trim();
          arrayItems.push(value);
        }
        continue;
      }
      
      // End previous array
      if (inArray && currentKey) {
        settings[currentKey] = arrayItems;
        inArray = false;
        arrayItems = [];
        currentKey = null;
      }
      
      // Key: value
      const match = line.match(/^(\w+):\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        
        if (value === '') {
          // Likely start of array
          currentKey = key;
          inArray = true;
          arrayItems = [];
        } else if (value === 'true') {
          settings[key] = true;
        } else if (value === 'false') {
          settings[key] = false;
        } else if (/^\d+$/.test(value)) {
          settings[key] = parseInt(value, 10);
        } else {
          settings[key] = value;
        }
      }
    }
    
    // Capture final array
    if (inArray && currentKey) {
      settings[currentKey] = arrayItems;
    }
    
    return settings;
  } catch (e) {
    console.warn(`[Provider Fallback] Failed to parse local settings: ${e.message}`);
    return null;
  }
}

async function main() {
  try {
    // Load global config first
    let config = providers.loadConfig();
    const usage = providers.loadUsage();
    
    // Check for project-local settings
    const localSettingsPath = path.join(process.cwd(), '.claude', 'provider-fallback.local.md');
    const localSettings = parseLocalSettings(localSettingsPath);
    
    if (localSettings) {
      // Check if enabled
      if (localSettings.enabled === false) {
        console.log('[Provider Fallback] Disabled for this project');
        return;
      }
      
      // Override with local settings
      if (localSettings.default_model) {
        config.defaultModel = localSettings.default_model;
      }
      if (localSettings.auto_switch !== undefined) {
        config.autoSwitch = localSettings.auto_switch;
      }
      if (localSettings.notify_on_switch !== undefined) {
        config.notifyOnSwitch = localSettings.notify_on_switch;
      }
      if (localSettings.provider_priority && Array.isArray(localSettings.provider_priority)) {
        config.providerPriority = localSettings.provider_priority;
      }
      
      console.log('[Provider Fallback] Using project-local configuration');
    }
    
    // Check OAuth tokens that need refresh
    const authStatus = auth.getAuthStatus();
    for (const [providerId, status] of Object.entries(authStatus)) {
      if (status.configured && status.needsRefresh && status.type === 'oauth') {
        try {
          console.log(`[Provider Fallback] Refreshing OAuth token for ${status.name}...`);
          await auth.refreshOAuthToken(providerId);
          console.log(`[Provider Fallback] Token refreshed for ${status.name}`);
        } catch (err) {
          console.warn(`[Provider Fallback] Failed to refresh ${status.name}: ${err.message}`);
        }
      }
    }
    
    // Get current primary provider
    const currentProvider = config.providerPriority[0];
    
    // Check if current provider has capacity
    if (!providers.hasCapacity(currentProvider, config, usage)) {
      if (config.autoSwitch) {
        const nextProvider = providers.getNextProvider(config.defaultModel, config, usage);
        
        if (nextProvider && nextProvider !== currentProvider) {
          const newPriority = [nextProvider, ...config.providerPriority.filter(p => p !== nextProvider)];
          config.providerPriority = newPriority;
          providers.saveConfig(config);
          console.log(`[Provider Fallback] Auto-switched from ${currentProvider} to ${nextProvider} (limit reached)`);
        } else if (!nextProvider) {
          console.warn('[Provider Fallback] Warning: All providers have reached their limits!');
        }
      } else {
        console.warn(`[Provider Fallback] Warning: ${currentProvider} has reached its limit (auto-switch disabled)`);
      }
    }
    
    // Display brief status with auth type
    const status = providers.getStatus();
    const activeProvider = config.providerPriority[0];
    const providerInfo = status.providers[activeProvider];
    const authInfo = authStatus[activeProvider];
    
    if (config.notifyOnSwitch !== false) {
      const authType = authInfo ? `[${authInfo.type}]` : '';
      console.log(`[Provider Fallback] Active: ${providerInfo?.name || activeProvider} ${authType} | ${providerInfo?.usage?.daily || '0'} daily`);
    }
    
    // Show configured providers by priority
    const byVendor = auth.getProvidersByVendor();
    const vendors = Object.keys(byVendor).filter(v => byVendor[v].some(p => p.configured));
    if (vendors.length > 0) {
      const summary = vendors.map(v => {
        const best = byVendor[v].find(p => p.configured);
        return `${v}:${best.type}`;
      }).join(', ');
      console.log(`[Provider Fallback] Configured: ${summary}`);
    }
    
  } catch (error) {
    console.error('[Provider Fallback] Error checking provider status:', error.message);
  }
}

main();
