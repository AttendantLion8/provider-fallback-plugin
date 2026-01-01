/**
 * Provider Fallback Plugin - Test Suite
 * Validates plugin structure and functionality
 * @version 2.2.0
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PLUGIN_ROOT = resolve(__dirname, '..');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

let passed = 0;
let failed = 0;
let warnings = 0;

function pass(message) {
  passed++;
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function fail(message) {
  failed++;
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function warn(message) {
  warnings++;
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function section(name) {
  console.log(`\n${colors.cyan}═══ ${name} ═══${colors.reset}`);
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

section('Plugin Structure');

// Check plugin.json
const pluginJsonPath = join(PLUGIN_ROOT, '.opencode-plugin', 'plugin.json');
if (existsSync(pluginJsonPath)) {
  pass('plugin.json exists');
  
  try {
    const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));
    
    if (pluginJson.name === 'provider-fallback') {
      pass(`Name: ${pluginJson.name}`);
    } else {
      fail(`Expected name 'provider-fallback', got '${pluginJson.name}'`);
    }
    
    if (pluginJson.version) {
      pass(`Version: ${pluginJson.version}`);
    } else {
      fail('Missing version');
    }
    
    // Check directories exist
    const dirs = ['commands', 'agents', 'skills', 'hooks'];
    for (const dir of dirs) {
      if (pluginJson[dir]) {
        const dirPath = join(PLUGIN_ROOT, pluginJson[dir].replace('./', '').replace('/hooks.json', ''));
        if (existsSync(dirPath)) {
          pass(`${dir} directory exists`);
        } else {
          fail(`${dir} directory missing: ${dirPath}`);
        }
      }
    }
  } catch (error) {
    fail(`Invalid plugin.json: ${error.message}`);
  }
} else {
  fail('plugin.json not found');
}

section('Commands');

const commandsDir = join(PLUGIN_ROOT, 'commands');
if (existsSync(commandsDir)) {
  const commands = readdirSync(commandsDir).filter(f => f.endsWith('.md'));
  
  if (commands.length >= 6) {
    pass(`${commands.length} commands found`);
    
    const expectedCommands = [
      'provider-status.md',
      'provider-switch.md',
      'provider-auth.md',
      'provider-models.md',
      'provider-priority.md',
      'provider-limits.md'
    ];
    
    for (const cmd of expectedCommands) {
      if (commands.includes(cmd)) {
        pass(`  ${cmd}`);
      } else {
        warn(`  Missing: ${cmd}`);
      }
    }
  } else {
    fail(`Expected at least 6 commands, found ${commands.length}`);
  }
} else {
  fail('Commands directory not found');
}

section('Library Modules');

const libDir = join(PLUGIN_ROOT, 'lib');
if (existsSync(libDir)) {
  const requiredModules = ['providers.js', 'models.js', 'auth.js'];
  const optionalModules = ['analytics.js', 'index.js'];
  
  for (const mod of requiredModules) {
    const modPath = join(libDir, mod);
    if (existsSync(modPath)) {
      const stats = statSync(modPath);
      pass(`${mod} (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      fail(`Missing required: ${mod}`);
    }
  }
  
  for (const mod of optionalModules) {
    const modPath = join(libDir, mod);
    if (existsSync(modPath)) {
      const stats = statSync(modPath);
      pass(`${mod} (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      warn(`Optional missing: ${mod}`);
    }
  }
} else {
  fail('lib directory not found');
}

section('Models Registry');

try {
  const modelsPath = join(PLUGIN_ROOT, 'lib', 'models.js');
  const modelsContent = readFileSync(modelsPath, 'utf-8');
  
  // Count model entries - look for top-level keys in MODEL_REGISTRY object
  // Pattern: '  'model-name': {' (2-space indent, quoted key, colon, brace)
  const modelMatches = modelsContent.match(/^  '[^']+': \{/gm) || [];
  const modelCount = modelMatches.length;
  
  if (modelCount >= 100) {
    pass(`${modelCount} models defined`);
  } else if (modelCount >= 50) {
    warn(`Only ${modelCount} models (expected 100+)`);
  } else {
    fail(`Only ${modelCount} models found`);
  }
  
  // Check for key model families
  const families = ['claude', 'gpt', 'gemini', 'antigravity', 'glm'];
  for (const family of families) {
    if (modelsContent.includes(`family: '${family}'`)) {
      pass(`  ${family} family present`);
    } else {
      warn(`  ${family} family missing`);
    }
  }
} catch (error) {
  fail(`Error reading models.js: ${error.message}`);
}

section('Providers Registry');

try {
  const providersPath = join(PLUGIN_ROOT, 'lib', 'providers.js');
  const providersContent = readFileSync(providersPath, 'utf-8');
  
  // Count provider entries - look for top-level keys in PROVIDERS object
  // Pattern: '  'provider-name': {' (2-space indent, quoted key, colon, brace)
  const providerMatches = providersContent.match(/^  '[^']+': \{/gm) || [];
  const providerCount = providerMatches.length;
  
  if (providerCount >= 20) {
    pass(`${providerCount} providers defined`);
  } else if (providerCount >= 10) {
    warn(`Only ${providerCount} providers (expected 20+)`);
  } else {
    fail(`Only ${providerCount} providers found`);
  }
  
  // Check for key providers
  const keyProviders = ['anthropic-subscription', 'openai-subscription', 'opencode-antigravity-auth'];
  for (const provider of keyProviders) {
    if (providersContent.includes(provider)) {
      pass(`  ${provider} present`);
    } else {
      warn(`  ${provider} missing`);
    }
  }
} catch (error) {
  fail(`Error reading providers.js: ${error.message}`);
}

section('Hooks');

const hooksJsonPath = join(PLUGIN_ROOT, 'hooks', 'hooks.json');
if (existsSync(hooksJsonPath)) {
  try {
    const hooksJson = JSON.parse(readFileSync(hooksJsonPath, 'utf-8'));
    
    // Check for hooks object with event keys
    if (hooksJson.hooks && typeof hooksJson.hooks === 'object') {
      const hookEvents = Object.keys(hooksJson.hooks);
      
      if (hookEvents.length >= 2) {
        pass(`${hookEvents.length} hook events defined`);
        
        for (const event of hookEvents) {
          const handlers = hooksJson.hooks[event];
          const count = Array.isArray(handlers) ? handlers.length : 1;
          pass(`  ${event}: ${count} handler(s)`);
        }
      } else if (hookEvents.length >= 1) {
        warn(`Only ${hookEvents.length} hook event(s) (expected 2+)`);
      } else {
        fail('No hooks defined');
      }
    } else {
      fail('Invalid hooks structure');
    }
  } catch (error) {
    fail(`Invalid hooks.json: ${error.message}`);
  }
} else {
  fail('hooks.json not found');
}

section('Additional Components');

// Check for MCP
const mcpDir = join(PLUGIN_ROOT, 'mcp');
if (existsSync(mcpDir) && existsSync(join(mcpDir, 'server.js'))) {
  pass('MCP server present');
} else {
  warn('MCP server not found');
}

// Check for scripts
const scriptsDir = join(PLUGIN_ROOT, 'scripts');
if (existsSync(scriptsDir)) {
  const scripts = readdirSync(scriptsDir).filter(f => f.endsWith('.js'));
  pass(`${scripts.length} utility scripts`);
} else {
  warn('Scripts directory not found');
}

// Check for templates
const templatesDir = join(PLUGIN_ROOT, 'templates');
if (existsSync(templatesDir)) {
  pass('Templates directory present');
} else {
  warn('Templates directory not found');
}

// Check for agent
const agentsDir = join(PLUGIN_ROOT, 'agents');
if (existsSync(agentsDir)) {
  const agents = readdirSync(agentsDir).filter(f => f.endsWith('.md'));
  pass(`${agents.length} agent(s) defined`);
} else {
  warn('Agents directory not found');
}

// ═══════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════

console.log('\n' + '═'.repeat(50));
console.log(`${colors.cyan}  Test Summary${colors.reset}`);
console.log('═'.repeat(50));
console.log(`  ${colors.green}Passed:${colors.reset}   ${passed}`);
console.log(`  ${colors.red}Failed:${colors.reset}   ${failed}`);
console.log(`  ${colors.yellow}Warnings:${colors.reset} ${warnings}`);
console.log('═'.repeat(50));

if (failed > 0) {
  console.log(`\n${colors.red}Some tests failed.${colors.reset}\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\n${colors.yellow}All tests passed with warnings.${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`\n${colors.green}All tests passed!${colors.reset}\n`);
  process.exit(0);
}
