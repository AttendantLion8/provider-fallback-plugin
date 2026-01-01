#!/usr/bin/env node
/**
 * Provider Fallback Plugin - Claude Code Integration Test
 * Tests the plugin with a simulated Claude Code environment
 * @version 2.3.0
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PLUGIN_ROOT = join(__dirname, '..');

// ANSI colors
const c = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', dim: '\x1b[2m'
};

let passed = 0;
let failed = 0;

function pass(msg) { passed++; console.log(`${c.green}✓${c.reset} ${msg}`); }
function fail(msg) { failed++; console.log(`${c.red}✗${c.reset} ${msg}`); }
function section(name) { console.log(`\n${c.cyan}═══ ${name} ═══${c.reset}`); }

// ═══════════════════════════════════════════════════════════════════════════
// MODULE IMPORT TESTS
// ═══════════════════════════════════════════════════════════════════════════

section('Module Imports');

let providers, models, auth, analytics;

try {
  providers = await import('../lib/providers.js');
  pass('providers.js loads as ESM');
} catch (e) {
  fail(`providers.js import: ${e.message}`);
}

try {
  models = await import('../lib/models.js');
  pass('models.js loads as ESM');
} catch (e) {
  fail(`models.js import: ${e.message}`);
}

try {
  auth = await import('../lib/auth.js');
  pass('auth.js loads as ESM');
} catch (e) {
  fail(`auth.js import: ${e.message}`);
}

try {
  analytics = await import('../lib/analytics.js');
  pass('analytics.js loads as ESM');
} catch (e) {
  fail(`analytics.js import: ${e.message}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDERS API TESTS
// ═══════════════════════════════════════════════════════════════════════════

section('Providers API');

if (providers) {
  // Test getProviders
  if (typeof providers.getProviders === 'function') {
    const providerList = providers.getProviders();
    if (Array.isArray(providerList) && providerList.length >= 20) {
      pass(`getProviders() returns ${providerList.length} providers`);
    } else {
      fail(`getProviders() returned ${providerList?.length || 0} providers`);
    }
  } else {
    fail('getProviders is not a function');
  }
  
  // Test getProvidersByFamily
  if (typeof providers.getProvidersByFamily === 'function') {
    const anthropic = providers.getProvidersByFamily('anthropic');
    if (Array.isArray(anthropic) && anthropic.length >= 3) {
      pass(`getProvidersByFamily('anthropic') returns ${anthropic.length} providers`);
    } else {
      fail(`getProvidersByFamily returned ${anthropic?.length || 0}`);
    }
  } else {
    fail('getProvidersByFamily is not a function');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MODELS API TESTS
// ═══════════════════════════════════════════════════════════════════════════

section('Models API');

if (models) {
  // Test getModels
  if (typeof models.getModels === 'function') {
    const modelList = models.getModels();
    if (Array.isArray(modelList) && modelList.length >= 100) {
      pass(`getModels() returns ${modelList.length} models`);
    } else {
      fail(`getModels() returned ${modelList?.length || 0} models`);
    }
  } else {
    fail('getModels is not a function');
  }
  
  // Test getModelById
  if (typeof models.getModelById === 'function') {
    const claude = models.getModelById('claude-4-sonnet');
    if (claude && claude.family === 'claude') {
      pass(`getModelById('claude-4-sonnet') works`);
    } else {
      fail('getModelById did not find claude-4-sonnet');
    }
  } else {
    fail('getModelById is not a function');
  }
  
  // Test getModelsByFamily
  if (typeof models.getModelsByFamily === 'function') {
    const gptModels = models.getModelsByFamily('gpt');
    if (Array.isArray(gptModels) && gptModels.length >= 30) {
      pass(`getModelsByFamily('gpt') returns ${gptModels.length} models`);
    } else {
      fail(`getModelsByFamily('gpt') returned ${gptModels?.length || 0}`);
    }
  } else {
    fail('getModelsByFamily is not a function');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH API TESTS
// ═══════════════════════════════════════════════════════════════════════════

section('Auth API');

if (auth) {
  // Test AUTH_PRIORITY
  if (auth.AUTH_PRIORITY && auth.AUTH_PRIORITY.subscription === 100) {
    pass('AUTH_PRIORITY exported correctly');
  } else {
    fail('AUTH_PRIORITY not exported or incorrect');
  }
  
  // Test isProviderConfigured / checkAuth
  if (typeof auth.isProviderConfigured === 'function' || typeof auth.checkAuth === 'function') {
    const checkFn = auth.checkAuth || auth.isProviderConfigured;
    const result = checkFn('anthropic-api');
    if (typeof result === 'boolean') {
      pass(`checkAuth() returns boolean (${result})`);
    } else {
      fail('checkAuth() did not return boolean');
    }
  } else {
    fail('checkAuth/isProviderConfigured not found');
  }
  
  // Test getAuthStatus
  if (typeof auth.getAuthStatus === 'function') {
    const status = auth.getAuthStatus();
    if (status && typeof status === 'object') {
      const providers = Object.keys(status);
      pass(`getAuthStatus() returns ${providers.length} provider statuses`);
    } else {
      fail('getAuthStatus() did not return object');
    }
  } else {
    fail('getAuthStatus is not a function');
  }
  
  // Test refreshOAuthToken exists
  if (typeof auth.refreshOAuthToken === 'function') {
    pass('refreshOAuthToken() is available');
  } else {
    fail('refreshOAuthToken() not found');
  }
  
  // Test scheduleTokenRefresh exists
  if (typeof auth.scheduleTokenRefresh === 'function') {
    pass('scheduleTokenRefresh() is available');
  } else {
    fail('scheduleTokenRefresh() not found');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS API TESTS
// ═══════════════════════════════════════════════════════════════════════════

section('Analytics API');

if (analytics) {
  // Test getSummary
  if (typeof analytics.getSummary === 'function') {
    const summary = analytics.getSummary('24h');
    if (summary && typeof summary === 'object') {
      pass('getSummary() works');
    } else {
      fail('getSummary() failed');
    }
  } else {
    fail('getSummary is not a function');
  }
  
  // Test recordRequest
  if (typeof analytics.recordRequest === 'function') {
    try {
      analytics.recordRequest({
        provider: 'test-provider',
        model: 'test-model',
        success: true,
        latencyMs: 100,
        tokensUsed: 50
      });
      pass('recordRequest() works');
    } catch (e) {
      fail(`recordRequest() failed: ${e.message}`);
    }
  } else {
    fail('recordRequest is not a function');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MCP SERVER TEST
// ═══════════════════════════════════════════════════════════════════════════

section('MCP Server');

const mcpTest = new Promise((resolve) => {
  const serverPath = join(PLUGIN_ROOT, 'mcp', 'server.js');
  
  if (!existsSync(serverPath)) {
    fail('MCP server.js not found');
    resolve(false);
    return;
  }
  
  // Start server with test port
  const server = spawn('node', [serverPath], {
    env: { ...process.env, MCP_PORT: '19999' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  let started = false;
  let output = '';
  
  server.stdout.on('data', (data) => {
    output += data.toString();
    if (output.includes('Running') && !started) {
      started = true;
      
      // Test health endpoint
      fetch('http://localhost:19999/health')
        .then(res => res.json())
        .then(data => {
          if (data.status === 'ok' && data.websocket === true) {
            pass('MCP server starts and supports WebSocket');
          } else {
            fail('MCP server response unexpected');
          }
          server.kill();
          resolve(true);
        })
        .catch(err => {
          fail(`MCP health check failed: ${err.message}`);
          server.kill();
          resolve(false);
        });
    }
  });
  
  server.stderr.on('data', (data) => {
    const msg = data.toString();
    if (!msg.includes('ExperimentalWarning')) {
      console.log(`${c.dim}[MCP stderr] ${msg}${c.reset}`);
    }
  });
  
  // Timeout after 10 seconds
  setTimeout(() => {
    if (!started) {
      fail('MCP server did not start within 10 seconds');
      server.kill();
      resolve(false);
    }
  }, 10000);
});

await mcpTest;

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n' + '═'.repeat(50));
console.log(`${c.cyan}  Integration Test Summary${c.reset}`);
console.log('═'.repeat(50));
console.log(`  ${c.green}Passed:${c.reset}   ${passed}`);
console.log(`  ${c.red}Failed:${c.reset}   ${failed}`);
console.log('═'.repeat(50));

if (failed > 0) {
  console.log(`\n${c.red}Some tests failed.${c.reset}\n`);
  process.exit(1);
} else {
  console.log(`\n${c.green}All integration tests passed!${c.reset}\n`);
  process.exit(0);
}
