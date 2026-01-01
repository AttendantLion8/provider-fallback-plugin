#!/usr/bin/env node
/**
 * Provider Fallback Plugin - WebSocket MCP Server
 * Model Context Protocol server with persistent WebSocket connections
 * @version 2.2.0
 * 
 * Supports:
 * - HTTP REST API (existing)
 * - WebSocket for persistent connections
 * - Server-Sent Events for streaming
 */

import { createServer } from 'http';
import { parse as parseUrl } from 'url';
import { createHash, randomBytes } from 'crypto';
import { EventEmitter } from 'events';

// Plugin imports (dynamic to handle both CJS and ESM)
let providers, models, auth, analytics;

async function loadModules() {
  try {
    providers = await import('../lib/providers.js');
    models = await import('../lib/models.js');
    auth = await import('../lib/auth.js');
    analytics = await import('../lib/analytics.js');
  } catch (error) {
    console.error('Failed to load modules:', error.message);
    // Provide stub implementations
    providers = { getProviders: () => [], getActiveProvider: () => null, setActiveProvider: () => false, getProvidersByFamily: () => [] };
    models = { getModels: () => [], getModelById: () => null, getModelsByFamily: () => [], getModelsByProvider: () => [] };
    auth = { checkAuth: () => false, getAuthStatus: () => ({}) };
    analytics = { getSummary: () => ({}), getProviderComparison: () => [], getCostAnalysis: () => [] };
  }
}

const PORT = process.env.MCP_PORT || 3847;
const HOST = process.env.MCP_HOST || 'localhost';
const WS_MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

// Event bus for real-time updates
const eventBus = new EventEmitter();
const wsClients = new Set();

// ═══════════════════════════════════════════════════════════════════════════
// MCP TOOL DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

const TOOLS = {
  // Provider Tools
  'provider.list': {
    description: 'List all available providers with their status',
    parameters: {
      type: 'object',
      properties: {
        family: { type: 'string', description: 'Filter by provider family' },
        authenticated: { type: 'boolean', description: 'Only show authenticated providers' }
      }
    },
    handler: async (params) => {
      let providerList = providers.getProviders();
      if (params.family) providerList = providers.getProvidersByFamily(params.family);
      if (params.authenticated) providerList = providerList.filter(p => auth.checkAuth(p.id));
      return providerList.map(p => ({
        id: p.id, name: p.name, family: p.family, priority: p.priority,
        authenticated: auth.checkAuth(p.id),
        active: providers.getActiveProvider()?.id === p.id
      }));
    }
  },
  
  'provider.active': {
    description: 'Get the currently active provider',
    parameters: { type: 'object', properties: {} },
    handler: async () => {
      const active = providers.getActiveProvider();
      if (!active) return { error: 'No active provider' };
      return { id: active.id, name: active.name, family: active.family, authenticated: auth.checkAuth(active.id) };
    }
  },
  
  'provider.switch': {
    description: 'Switch to a different provider',
    parameters: {
      type: 'object',
      properties: { providerId: { type: 'string', description: 'Provider ID to switch to' } },
      required: ['providerId']
    },
    handler: async (params) => {
      const success = providers.setActiveProvider(params.providerId);
      if (success) {
        eventBus.emit('provider.switched', { providerId: params.providerId, timestamp: Date.now() });
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
        family: { type: 'string' }, provider: { type: 'string' }, capability: { type: 'string' }
      }
    },
    handler: async (params) => {
      let modelList = models.getModels();
      if (params.family) modelList = models.getModelsByFamily(params.family);
      if (params.provider) modelList = models.getModelsByProvider(params.provider);
      if (params.capability) modelList = modelList.filter(m => m.capabilities?.includes(params.capability));
      return modelList.map(m => ({ id: m.id, name: m.name, family: m.family, contextWindow: m.contextWindow, capabilities: m.capabilities }));
    }
  },
  
  'model.info': {
    description: 'Get detailed information about a specific model',
    parameters: {
      type: 'object',
      properties: { modelId: { type: 'string', description: 'Model ID' } },
      required: ['modelId']
    },
    handler: async (params) => {
      const model = models.getModelById(params.modelId);
      return model || { error: 'Model not found' };
    }
  },
  
  // Analytics Tools
  'analytics.summary': {
    description: 'Get usage analytics summary',
    parameters: {
      type: 'object',
      properties: { period: { type: 'string', enum: ['1h', '24h', '7d', '30d', 'all'] } }
    },
    handler: async (params) => analytics.getSummary(params.period || '24h')
  },
  
  'analytics.providers': {
    description: 'Get provider comparison analytics',
    parameters: { type: 'object', properties: {} },
    handler: async () => analytics.getProviderComparison()
  },
  
  'analytics.costs': {
    description: 'Get cost analysis',
    parameters: {
      type: 'object',
      properties: { groupBy: { type: 'string', enum: ['provider', 'model', 'day'] } }
    },
    handler: async (params) => analytics.getCostAnalysis(params.groupBy || 'provider')
  },
  
  // Auth Tools
  'auth.status': {
    description: 'Get authentication status for all providers',
    parameters: { type: 'object', properties: {} },
    handler: async () => auth.getAuthStatus()
  },
  
  'auth.check': {
    description: 'Check authentication for a specific provider',
    parameters: {
      type: 'object',
      properties: { providerId: { type: 'string', description: 'Provider ID to check' } },
      required: ['providerId']
    },
    handler: async (params) => ({ providerId: params.providerId, authenticated: auth.checkAuth(params.providerId) })
  },
  
  // Subscription Tools (WebSocket-specific)
  'subscribe': {
    description: 'Subscribe to real-time events',
    parameters: {
      type: 'object',
      properties: {
        events: { type: 'array', items: { type: 'string' }, description: 'Event types to subscribe to' }
      }
    },
    handler: async (params, context) => {
      if (!context?.ws) return { error: 'WebSocket required for subscriptions' };
      const events = params.events || ['provider.switched', 'analytics.update', 'auth.changed'];
      context.subscriptions = events;
      return { subscribed: events };
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// WEBSOCKET IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

function handleWebSocketUpgrade(req, socket) {
  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }
  
  const acceptKey = createHash('sha256')
    .update(key + WS_MAGIC)
    .digest('base64');
  
  const response = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptKey}`,
    '',
    ''
  ].join('\r\n');
  
  socket.write(response);
  
  const client = {
    id: randomBytes(8).toString('hex'),
    socket,
    subscriptions: [],
    createdAt: Date.now()
  };
  
  wsClients.add(client);
  console.log(`[WS] Client connected: ${client.id}`);
  
  // Send welcome message
  sendWSMessage(client, { type: 'connected', id: client.id, tools: Object.keys(TOOLS).length });
  
  let buffer = Buffer.alloc(0);
  
  socket.on('data', (data) => {
    buffer = Buffer.concat([buffer, data]);
    
    while (buffer.length >= 2) {
      const firstByte = buffer[0];
      const secondByte = buffer[1];
      const opcode = firstByte & 0x0F;
      const masked = (secondByte & 0x80) !== 0;
      let payloadLength = secondByte & 0x7F;
      let offset = 2;
      
      if (payloadLength === 126) {
        if (buffer.length < 4) return;
        payloadLength = buffer.readUInt16BE(2);
        offset = 4;
      } else if (payloadLength === 127) {
        if (buffer.length < 10) return;
        payloadLength = Number(buffer.readBigUInt64BE(2));
        offset = 10;
      }
      
      const maskOffset = offset;
      if (masked) offset += 4;
      
      const totalLength = offset + payloadLength;
      if (buffer.length < totalLength) return;
      
      let payload = buffer.slice(offset, totalLength);
      
      if (masked) {
        const mask = buffer.slice(maskOffset, maskOffset + 4);
        for (let i = 0; i < payload.length; i++) {
          payload[i] ^= mask[i % 4];
        }
      }
      
      buffer = buffer.slice(totalLength);
      
      // Handle opcodes
      if (opcode === 0x08) {
        // Close frame
        socket.end();
        return;
      } else if (opcode === 0x09) {
        // Ping - send pong
        const pong = Buffer.alloc(2);
        pong[0] = 0x8A;
        pong[1] = 0;
        socket.write(pong);
      } else if (opcode === 0x01) {
        // Text frame
        handleWSMessage(client, payload.toString('utf8'));
      }
    }
  });
  
  socket.on('close', () => {
    wsClients.delete(client);
    console.log(`[WS] Client disconnected: ${client.id}`);
  });
  
  socket.on('error', (err) => {
    console.error(`[WS] Client error ${client.id}:`, err.message);
    wsClients.delete(client);
  });
}

function sendWSMessage(client, data) {
  const payload = Buffer.from(JSON.stringify(data), 'utf8');
  const frame = Buffer.alloc(2 + (payload.length > 125 ? 2 : 0) + payload.length);
  
  frame[0] = 0x81; // Text frame, FIN
  
  if (payload.length <= 125) {
    frame[1] = payload.length;
    payload.copy(frame, 2);
  } else {
    frame[1] = 126;
    frame.writeUInt16BE(payload.length, 2);
    payload.copy(frame, 4);
  }
  
  try {
    client.socket.write(frame);
  } catch (error) {
    console.error(`[WS] Send error to ${client.id}:`, error.message);
  }
}

async function handleWSMessage(client, message) {
  try {
    const { id, tool, params = {} } = JSON.parse(message);
    
    if (!TOOLS[tool]) {
      sendWSMessage(client, { id, error: `Tool not found: ${tool}` });
      return;
    }
    
    const result = await TOOLS[tool].handler(params, { ws: true, client });
    sendWSMessage(client, { id, result });
    
  } catch (error) {
    sendWSMessage(client, { error: error.message });
  }
}

// Broadcast events to subscribed clients
eventBus.on('provider.switched', (data) => {
  for (const client of wsClients) {
    if (client.subscriptions.includes('provider.switched')) {
      sendWSMessage(client, { type: 'event', event: 'provider.switched', data });
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// HTTP HANDLER
// ═══════════════════════════════════════════════════════════════════════════

async function handleHTTPRequest(req, res) {
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
        status: 'ok', name: 'provider-fallback-mcp', version: '2.2.0',
        tools: Object.keys(TOOLS).length,
        websocket: true,
        wsClients: wsClients.size
      }));
      return;
    }
    
    // List tools
    if (path === '/tools') {
      res.writeHead(200);
      res.end(JSON.stringify({
        tools: Object.entries(TOOLS).map(([name, tool]) => ({
          name, description: tool.description, parameters: tool.parameters
        }))
      }));
      return;
    }
    
    // Server-Sent Events stream
    if (path === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      
      const handler = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };
      
      eventBus.on('provider.switched', (data) => handler('provider.switched', data));
      eventBus.on('analytics.update', (data) => handler('analytics.update', data));
      
      req.on('close', () => {
        eventBus.removeListener('provider.switched', handler);
        eventBus.removeListener('analytics.update', handler);
      });
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
    
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    
  } catch (error) {
    console.error('HTTP Error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVER STARTUP
// ═══════════════════════════════════════════════════════════════════════════

async function startServer() {
  await loadModules();
  
  const server = createServer(handleHTTPRequest);
  
  server.on('upgrade', (req, socket, head) => {
    if (req.headers['upgrade']?.toLowerCase() === 'websocket') {
      handleWebSocketUpgrade(req, socket);
    } else {
      socket.destroy();
    }
  });
  
  server.listen(PORT, HOST, () => {
    console.log('═'.repeat(55));
    console.log('  Provider Fallback - MCP Server (WebSocket Enabled)');
    console.log('═'.repeat(55));
    console.log(`  Status:     Running`);
    console.log(`  HTTP:       http://${HOST}:${PORT}`);
    console.log(`  WebSocket:  ws://${HOST}:${PORT}`);
    console.log(`  SSE:        http://${HOST}:${PORT}/events`);
    console.log(`  Tools:      ${Object.keys(TOOLS).length}`);
    console.log('═'.repeat(55));
    console.log('\nEndpoints:');
    console.log('  GET  /health     - Health check');
    console.log('  GET  /tools      - List available tools');
    console.log('  POST /execute    - Execute a tool');
    console.log('  GET  /tool/:name - Execute tool via GET');
    console.log('  GET  /events     - Server-Sent Events stream');
    console.log('  WS   /           - WebSocket connection\n');
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

startServer();
