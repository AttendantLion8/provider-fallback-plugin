#!/usr/bin/env node
/**
 * Notification Hook - Handle Rate Limit/Quota Errors
 * Automatically switches to next available provider with auth priority.
 */

const path = require('path');
const providers = require(path.join(__dirname, '..', '..', 'lib', 'providers.js'));
const auth = require(path.join(__dirname, '..', '..', 'lib', 'auth.js'));
const models = require(path.join(__dirname, '..', '..', 'lib', 'models.js'));

async function main() {
  try {
    const config = providers.loadConfig();
    const usage = providers.loadUsage();
    
    if (!config.autoSwitch) {
      console.log('[Provider Fallback] Rate limit detected but auto-switch is disabled');
      return;
    }
    
    const currentProvider = config.providerPriority[0];
    
    // Mark current provider as exhausted for today
    const limits = config.usageLimits[currentProvider];
    if (limits && usage.providers[currentProvider]) {
      usage.providers[currentProvider].dailyTokens = limits.dailyTokens;
      providers.saveUsage(usage);
    }
    
    // Get current model's family to find compatible providers
    const modelInfo = models.getModelInfo(config.defaultModel);
    const modelProviders = modelInfo ? Object.keys(modelInfo.providers) : [];
    
    // Find next available provider with auth priority
    let nextProvider = null;
    const configuredProviders = auth.getConfiguredProvidersByPriority();
    
    for (const provider of configuredProviders) {
      // Skip current exhausted provider
      if (provider.id === currentProvider) continue;
      
      // Check if this provider supports the current model
      if (modelProviders.length > 0 && !modelProviders.includes(provider.id)) continue;
      
      // Check capacity
      if (providers.hasCapacity(provider.id, config, usage)) {
        nextProvider = provider;
        break;
      }
    }
    
    if (nextProvider && nextProvider.id !== currentProvider) {
      // Switch to next provider
      const newPriority = [nextProvider.id, ...config.providerPriority.filter(p => p !== nextProvider.id)];
      config.providerPriority = newPriority;
      providers.saveConfig(config);
      
      console.log(`[Provider Fallback] Rate limit hit on ${currentProvider}. Switched to ${nextProvider.name} [${nextProvider.type}]`);
      console.log('[Provider Fallback] Please retry the last request.');
    } else {
      console.error('[Provider Fallback] All providers exhausted! Cannot switch.');
      console.log('[Provider Fallback] Consider:');
      console.log('  1. Adding more providers with /provider-auth setup <provider>');
      console.log('  2. Using subscription auth (highest priority): /provider-auth setup <vendor>-subscription');
      console.log('  3. Increasing limits with /provider-limits <provider> --daily <limit>');
      console.log('  4. Waiting for daily limit reset');
    }
    
  } catch (error) {
    console.error('[Provider Fallback] Error handling rate limit:', error.message);
  }
}

main();
