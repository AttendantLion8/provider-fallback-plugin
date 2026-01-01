#!/usr/bin/env node
/**
 * Provider Fallback Plugin - Installation Script
 * Installs the plugin to Claude Code/OpenCode plugin directories
 * @version 2.2.0
 */

import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PLUGIN_ROOT = resolve(__dirname, '..');

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`${colors.cyan}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

/**
 * Detect Claude Code/OpenCode installation paths
 */
function detectInstallPaths() {
  const home = homedir();
  const paths = [];
  
  // Standard Claude Code paths
  const claudePaths = [
    join(home, '.claude', 'plugins'),
    join(home, '.config', 'claude', 'plugins'),
    join(home, 'AppData', 'Local', 'claude', 'plugins'), // Windows
    join(home, 'Library', 'Application Support', 'claude', 'plugins') // macOS
  ];
  
  // OpenCode paths
  const opencodePaths = [
    join(home, '.opencode', 'plugins'),
    join(home, '.config', 'opencode', 'plugins'),
    join(home, 'plugins') // Project-level (current location)
  ];
  
  // Check each path
  for (const p of [...claudePaths, ...opencodePaths]) {
    const parentDir = dirname(p);
    if (existsSync(parentDir)) {
      paths.push({
        path: p,
        exists: existsSync(p),
        type: p.includes('opencode') ? 'opencode' : 'claude'
      });
    }
  }
  
  return paths;
}

/**
 * Install plugin to a target directory
 */
function installToPath(targetPath) {
  const pluginDir = join(targetPath, 'provider-fallback-plugin');
  
  try {
    // Create target directory if it doesn't exist
    if (!existsSync(targetPath)) {
      mkdirSync(targetPath, { recursive: true });
      logSuccess(`Created directory: ${targetPath}`);
    }
    
    // Copy plugin files
    cpSync(PLUGIN_ROOT, pluginDir, { 
      recursive: true,
      filter: (src) => {
        // Exclude certain files/directories
        const excludes = ['node_modules', '.git', '.data', '*.local.md'];
        return !excludes.some(ex => src.includes(ex.replace('*', '')));
      }
    });
    
    logSuccess(`Installed to: ${pluginDir}`);
    return true;
  } catch (error) {
    logError(`Failed to install to ${targetPath}: ${error.message}`);
    return false;
  }
}

/**
 * Create per-project configuration
 */
function createProjectConfig(projectPath = process.cwd()) {
  const configDir = join(projectPath, '.claude');
  const configFile = join(configDir, 'provider-fallback.local.md');
  
  if (existsSync(configFile)) {
    logWarning(`Config already exists: ${configFile}`);
    return false;
  }
  
  try {
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }
    
    // Copy template
    const templatePath = join(PLUGIN_ROOT, 'templates', 'provider-fallback.local.md');
    if (existsSync(templatePath)) {
      cpSync(templatePath, configFile);
      logSuccess(`Created project config: ${configFile}`);
      return true;
    } else {
      // Create minimal config
      const minimalConfig = `---
# Provider Fallback - Project Configuration
default_model: claude-sonnet-4-20250514
auto_switch: true
priority_override: []
---

# Project-Specific Provider Settings

This file configures provider fallback behavior for this project.
`;
      writeFileSync(configFile, minimalConfig);
      logSuccess(`Created minimal project config: ${configFile}`);
      return true;
    }
  } catch (error) {
    logError(`Failed to create config: ${error.message}`);
    return false;
  }
}

/**
 * Main installation flow
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  log('  Provider Fallback Plugin - Installation', 'cyan');
  log('  Version 2.2.0', 'dim');
  console.log('='.repeat(60) + '\n');
  
  // Parse arguments
  const args = process.argv.slice(2);
  const forceInstall = args.includes('--force') || args.includes('-f');
  const projectOnly = args.includes('--project') || args.includes('-p');
  const targetPath = args.find(a => !a.startsWith('-'));
  
  // Step 1: Detect installation paths
  logStep('1/4', 'Detecting installation paths...');
  const paths = detectInstallPaths();
  
  if (paths.length === 0 && !targetPath) {
    logWarning('No standard plugin directories found.');
    log('  Specify a target path: node install.js /path/to/plugins', 'dim');
    log('  Or create project config: node install.js --project', 'dim');
    process.exit(1);
  }
  
  // Show detected paths
  for (const p of paths) {
    const status = p.exists ? 'exists' : 'will create';
    log(`  ${p.type}: ${p.path} (${status})`, 'dim');
  }
  
  // Step 2: Install to paths
  logStep('2/4', 'Installing plugin...');
  
  let installed = 0;
  
  if (targetPath) {
    // Install to specified path
    if (installToPath(targetPath)) {
      installed++;
    }
  } else if (!projectOnly) {
    // Install to first available path of each type
    const claudePath = paths.find(p => p.type === 'claude');
    const opencodePath = paths.find(p => p.type === 'opencode');
    
    if (claudePath) {
      if (installToPath(claudePath.path)) installed++;
    }
    if (opencodePath && opencodePath.path !== claudePath?.path) {
      if (installToPath(opencodePath.path)) installed++;
    }
    
    // If no paths found, install to user plugins
    if (installed === 0) {
      const fallbackPath = join(homedir(), 'plugins');
      if (installToPath(fallbackPath)) installed++;
    }
  }
  
  // Step 3: Create project config
  logStep('3/4', 'Creating project configuration...');
  createProjectConfig();
  
  // Step 4: Verify installation
  logStep('4/4', 'Verifying installation...');
  
  // Check if plugin.json is accessible
  const pluginJson = join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json');
  if (existsSync(pluginJson)) {
    const config = JSON.parse(readFileSync(pluginJson, 'utf-8'));
    logSuccess(`Plugin verified: ${config.name} v${config.version}`);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  if (installed > 0 || projectOnly) {
    log('  Installation Complete!', 'green');
    console.log('='.repeat(60));
    
    log('\n  Next steps:', 'cyan');
    log('  1. Restart Claude Code / OpenCode', 'dim');
    log('  2. Run: /provider-status to check providers', 'dim');
    log('  3. Run: /provider-auth to configure authentication', 'dim');
    log('  4. Run: /provider-models to list available models', 'dim');
  } else {
    log('  Installation Incomplete', 'yellow');
    console.log('='.repeat(60));
    log('\n  Try:', 'cyan');
    log('  node install.js /path/to/plugins', 'dim');
  }
  
  console.log('\n');
}

main().catch(error => {
  logError(`Installation failed: ${error.message}`);
  process.exit(1);
});
