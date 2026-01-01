#!/usr/bin/env node
/**
 * Provider Fallback Plugin - Uninstallation Script
 * @version 2.2.0
 */

import { existsSync, rmSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

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

function findInstallations() {
  const home = homedir();
  const locations = [];
  
  const searchPaths = [
    join(home, '.claude', 'plugins'),
    join(home, '.config', 'claude', 'plugins'),
    join(home, 'AppData', 'Local', 'claude', 'plugins'),
    join(home, 'Library', 'Application Support', 'claude', 'plugins'),
    join(home, '.opencode', 'plugins'),
    join(home, '.config', 'opencode', 'plugins'),
    join(home, 'plugins')
  ];
  
  for (const basePath of searchPaths) {
    const pluginPath = join(basePath, 'provider-fallback-plugin');
    if (existsSync(pluginPath)) {
      locations.push(pluginPath);
    }
  }
  
  return locations;
}

async function main() {
  console.log('\n' + '='.repeat(60));
  log('  Provider Fallback Plugin - Uninstallation', 'cyan');
  console.log('='.repeat(60) + '\n');
  
  const args = process.argv.slice(2);
  const force = args.includes('--force') || args.includes('-f');
  
  const installations = findInstallations();
  
  if (installations.length === 0) {
    log('No installations found.', 'yellow');
    process.exit(0);
  }
  
  log('Found installations:', 'cyan');
  for (const path of installations) {
    log(`  - ${path}`, 'dim');
  }
  console.log();
  
  if (!force) {
    log('Run with --force to remove these installations.', 'yellow');
    process.exit(0);
  }
  
  for (const path of installations) {
    try {
      rmSync(path, { recursive: true, force: true });
      log(`✓ Removed: ${path}`, 'green');
    } catch (error) {
      log(`✗ Failed to remove: ${path} - ${error.message}`, 'red');
    }
  }
  
  console.log('\n' + '='.repeat(60));
  log('  Uninstallation Complete', 'green');
  console.log('='.repeat(60) + '\n');
}

main();
