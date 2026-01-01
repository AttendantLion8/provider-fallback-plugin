#!/usr/bin/env node
/**
 * Provider Fallback Plugin - MCP Server
 * Model Context Protocol server for external integrations
 * @version 2.2.0
 * 
 * Provides tools for:
 * - Provider status and switching
 * - Model information
 * - Usage analytics
 * - Authentication management
 */

import { createServer } from 'http';
import { parse as parseUrl } from 'url';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import plugin modules
import { 
  getProviders, 
  getActiveProvider, 
  setActiveProvider,
  getProvidersByFamily 
} from '../lib/providers.js';
import { 
  getModels, 
  getModelById, 
  getModelsByFamily,
  getModelsByProvider 
} from '../lib/models.js';
import { 
  checkAuth, 
  getAuthStatus 
} from '../lib/auth.js';
import { 
  getSummary, 
  getProviderComparison, 
  getCostAnalysis,
  recordRequest 
} from '../lib/analytics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.MCP_PORT || 3847;
const HOST = process.env.MCP_HOST || 'localhost';

/**
 * MCP Tool Definitions
 */
const TOOLS = {
  // Provider Tools
  'provider.list': {
    description: 'List all available providers with their status',
    parameters: {
      type: 'object',
      properties: {
        family: { type: 'string', description: 'Filter by provider family (anthropic, openai, google, etc.)' },
        authenticated: { type: 'boolean', description: 'Only show authenticated providers' }
      }
    },
    handler: async (params) => {
      let providers = getProviders();
      
      if (params.family) {
        providers = getProvidersByFamily(params.family);
      }
      
      if (params.authenticated) {
        providers = providers.filter(p => checkAuth(p.id));
      }
      
      return providers.map(p => ({
        id: p.id,
        name: p.name,
        family: p.family,
        priority: p.priority,
        authenticated: checkAuth(p.id),
        active: getActiveProvider()?.id === p.id
      }));
    }
  },
  
  'provider.active': {
    description: 'Get the currently active provider',
    parameters: { type: 'object', properties: {} },
    handler: async () => {
      const active = getActiveProvider();
      if (!active) {
        return { error: 'No active provider' };
      }
      return {
        id: active.id,
        name: active.name,
        family: active.family,
        authenticated: checkAuth(active.id)
      };
    }
  },
  
  'provider.switch': {
    description: 'Switch to a different provider',
    parameters: {
      type: 'object',
      properties: {
        providerId: { type: 'string', description: 'Provider ID to switch to' }
      },
      required: ['providerId']
    },
    handler: async (params) => {
      const success = setActiveProvider(params.providerId);
      if (success) {
        return { success: true, provider: params.providerId };
      }
      return { success: false, error: 'Provider not found or not authenticated' };
    }
  },
  
  // Model Tools
  'model.list': {
    description: 'List all available models',
    parameters: {
      type: 'object',
      properties: {
        family: { type: 'string', description: 'Filter by model family' },
        provider: { type: 'string', description: 'Filter by provider ID' },
        capability: { type: 'string', description: 'Filter by capability (vision, code, etc.)' }
      }
    },
    handler: async (params) => {
      let models = getModels();
      
      if (params.family) {
        models = getModelsByFamily(params.family);
      }
      
      if (params.provider) {
        models = getModelsByProvider(params.provider);
      }
      
      if (params.capability) {
        models = models.filter(m => m.capabilities?.includes(params.capability));
      }
      
      return models.map(m => ({
        id: m.id,
        name: m.name,
        family: m.family,
        contextWindow: m.contextWindow,
        capabilities: m.capabilities
      }));
    }
  },
  
  'model.info': {
    description: 'Get detailed information about a specific model',
    parameters: {
      type: 'object',
      properties: {
        modelId: { type: 'string', description: 'Model ID' }
      },
      required: ['modelId']
    },
    handler: async (params) => {
      const model = getModelById(params.modelId);
      if (!model) {
        return { error: 'Model not found' };
      }
      return model;
    }
  },
  
  // Analytics Tools
  'analytics.summary': {
    description: 'Get usage analytics summary',
    parameters: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['1h', '24h', '7d', '30d', 'all'], description: 'Time period' }
      }
    },
    handler: async (params) => {
      return getSummary(params.period || '24h');
    }
  },
  
  'analytics.providers': {
    description: 'Get provider comparison analytics',
    parameters: { type: 'object', properties: {} },
    handler: async () => {
      return getProviderComparison();
    }
  },
  
  'analytics.costs': {
    description: 'Get cost analysis',
    parameters: {
      type: 'object',
      properties: {
        groupBy: { type: 'string', enum: ['provider', 'model', 'day'], description: 'Group costs by' }
      }
    },
    handler: async (params) => {
      return getCostAnalysis(params.groupBy || 'provider');
    }
  },
  
  // Auth Tools
  'auth.status': {
    description: 'Get authentication status for all providers',
    parameters: { type: 'object', properties: {} },
    handler: async () => {
      return getAuthStatus();
    }
  },
  
  'auth.check': {
    description: 'Check authentication for a specific provider',
    parameters: {
      type: 'object',
      properties: {
        providerId: { type: 'string', description: 'Provider ID to check' }
      },
      required: ['providerId']
    },
    handler: async (params) => {
      return {
        providerId: params.providerId,
        authenticated: checkAuth(params.providerId)
      };
    }
  }
};

/**
 * Handle MCP request
 */
async function handleMCPRequest(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const url = parseUrl(req.url, true);
  const path = url.pathname;
  
  try {
    // Health check
    if (path === '/health' || path === '/') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'ok',
        name: 'provider-fallback-mcp',
        version: '2.2.0',
        tools: Object.keys(TOOLS).length
      }));
      return;
    }
    
    // List tools
    if (path === '/tools') {
      res.writeHead(200);
      res.end(JSON.stringify({
        tools: Object.entries(TOOLS).map(([name, tool]) => ({
          name,
          description: tool.description,
          parameters: tool.parameters
        }))
      }));
      return;
    }
    
    // Execute tool
    if (path === '/execute' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { tool, params = {} } = JSON.parse(body);
          
          if (!TOOLS[tool]) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: `Tool not found: ${tool}` }));
            return;
          }
          
          const result = await TOOLS[tool].handler(params);
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, result }));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }
    
    // Tool-specific endpoints (GET)
    if (path.startsWith('/tool/')) {
      const toolName = path.slice(6).replace(/\//g, '.');
      const tool = TOOLS[toolName];
      
      if (!tool) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: `Tool not found: ${toolName}` }));
        return;
      }
      
      const result = await tool.handler(url.query);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, result }));
      return;
    }
    
    // Not found
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    
  } catch (error) {
    console.error('MCP Error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
}

/**
 * Start MCP server
 */
function startServer() {
  const server = createServer(handleMCPRequest);
  
  server.listen(PORT, HOST, () => {
    console.log('═'.repeat(50));
    console.log('  Provider Fallback - MCP Server');
    console.log('═'.repeat(50));
    console.log(`  Status:  Running`);
    console.log(`  URL:     http://${HOST}:${PORT}`);
    console.log(`  Tools:   ${Object.keys(TOOLS).length}`);
    console.log('═'.repeat(50));
    console.log('\nEndpoints:');
    console.log('  GET  /health     - Health check');
    console.log('  GET  /tools      - List available tools');
    console.log('  POST /execute    - Execute a tool');
    console.log('  GET  /tool/:name - Execute tool via GET\n');
    console.log('Press Ctrl+C to stop.\n');
  });
  
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.`);
      console.error(`Try: MCP_PORT=3848 node mcp/server.js`);
    } else {
      console.error('Server error:', error);
    }
    process.exit(1);
  });
}

// Start if run directly
startServer();
