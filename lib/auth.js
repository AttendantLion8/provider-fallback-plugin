/**
 * Authentication Manager - OAuth, Subscription, and API key support
 * Priority: Subscription (100) > OAuth (50) > API (10)
 * @version 2.2.0
 * 
 * Features:
 * - Multi-auth type support per provider
 * - Automatic OAuth token refresh
 * - Secure credential storage
 * - Environment variable detection
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { request as httpsRequest } from 'https';
import { request as httpRequest, createServer } from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_DIR = join(homedir(), '.claude', 'provider-fallback');
const AUTH_FILE = join(CONFIG_DIR, 'auth.json');
const TOKENS_FILE = join(CONFIG_DIR, 'tokens.json');

export const AUTH_PRIORITY = { subscription: 100, oauth: 50, api: 10 };

export const PROVIDER_AUTH_CONFIG = {
  // ANTHROPIC
  'anthropic-subscription': {
    vendor: 'anthropic', type: 'subscription', name: 'Anthropic Pro/Max Subscription',
    configKeys: ['sessionToken', 'organizationId'], envKeys: ['ANTHROPIC_SESSION_TOKEN', 'ANTHROPIC_SUBSCRIPTION_KEY'],
    baseUrl: 'https://api.anthropic.com'
  },
  'anthropic-oauth': {
    vendor: 'anthropic', type: 'oauth', name: 'Anthropic OAuth',
    configKeys: ['accessToken', 'refreshToken', 'expiresAt', 'clientId', 'clientSecret'], envKeys: [],
    oauthConfig: {
      authUrl: 'https://console.anthropic.com/oauth/authorize',
      tokenUrl: 'https://console.anthropic.com/oauth/token',
      scopes: ['read', 'write'], redirectUri: 'http://localhost:19284/callback'
    },
    baseUrl: 'https://api.anthropic.com'
  },
  'anthropic-api': {
    vendor: 'anthropic', type: 'api', name: 'Anthropic API Key',
    configKeys: ['apiKey'], envKeys: ['ANTHROPIC_API_KEY'],
    baseUrl: 'https://api.anthropic.com'
  },

  // OPENAI
  'openai-subscription': {
    vendor: 'openai', type: 'subscription', name: 'ChatGPT Plus/Pro Subscription',
    configKeys: ['sessionToken', 'accessToken'], envKeys: ['OPENAI_SESSION_TOKEN', 'OPENAI_SUBSCRIPTION_KEY'],
    baseUrl: 'https://api.openai.com'
  },
  'openai-oauth': {
    vendor: 'openai', type: 'oauth', name: 'OpenAI OAuth',
    configKeys: ['accessToken', 'refreshToken', 'expiresAt', 'clientId', 'clientSecret'], envKeys: [],
    oauthConfig: {
      authUrl: 'https://auth.openai.com/authorize',
      tokenUrl: 'https://auth.openai.com/oauth/token',
      scopes: ['openid', 'profile', 'model.read', 'model.request'],
      redirectUri: 'http://localhost:19284/callback'
    },
    baseUrl: 'https://api.openai.com'
  },
  'openai-api': {
    vendor: 'openai', type: 'api', name: 'OpenAI API Key',
    configKeys: ['apiKey'], envKeys: ['OPENAI_API_KEY'],
    baseUrl: 'https://api.openai.com'
  },

  // GOOGLE
  'google-subscription': {
    vendor: 'google', type: 'subscription', name: 'Google One AI Premium',
    configKeys: ['authToken', 'accountId'], envKeys: ['GOOGLE_AI_SESSION', 'GOOGLE_AI_SUBSCRIPTION'],
    baseUrl: 'https://generativelanguage.googleapis.com'
  },
  'google-oauth': {
    vendor: 'google', type: 'oauth', name: 'Google OAuth',
    configKeys: ['accessToken', 'refreshToken', 'expiresAt', 'clientId', 'clientSecret'], envKeys: [],
    oauthConfig: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/generative-language.retriever', 'https://www.googleapis.com/auth/cloud-platform'],
      redirectUri: 'http://localhost:19284/callback'
    },
    baseUrl: 'https://generativelanguage.googleapis.com'
  },
  'google-api': {
    vendor: 'google', type: 'api', name: 'Google AI Studio API Key',
    configKeys: ['apiKey'], envKeys: ['GOOGLE_API_KEY', 'GEMINI_API_KEY'],
    baseUrl: 'https://generativelanguage.googleapis.com'
  },

  // OPENCODE ANTIGRAVITY (User-requested)
  'opencode-antigravity-auth': {
    vendor: 'opencode', type: 'oauth', name: 'OpenCode Antigravity Auth',
    configKeys: ['accessToken', 'refreshToken', 'expiresAt'], 
    envKeys: ['OPENCODE_ANTIGRAVITY_TOKEN', 'ANTIGRAVITY_AUTH_TOKEN', 'OC_ANTIGRAVITY_KEY'],
    oauthConfig: {
      authUrl: 'https://auth.opencode.ai/oauth/authorize',
      tokenUrl: 'https://auth.opencode.ai/oauth/token',
      scopes: ['models', 'inference'],
      redirectUri: 'http://localhost:19284/callback'
    },
    baseUrl: 'https://api.opencode.ai'
  },

  // CLOUD PROVIDERS
  'bedrock': {
    vendor: 'aws', type: 'api', name: 'AWS Bedrock',
    configKeys: ['accessKeyId', 'secretAccessKey', 'region'],
    envKeys: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'],
    baseUrl: 'https://bedrock-runtime.{region}.amazonaws.com'
  },
  'vertex': {
    vendor: 'gcp', type: 'api', name: 'Google Vertex AI (Claude)',
    configKeys: ['projectId', 'location', 'serviceAccountKey'],
    envKeys: ['GOOGLE_APPLICATION_CREDENTIALS', 'GOOGLE_CLOUD_PROJECT'],
    baseUrl: 'https://{location}-aiplatform.googleapis.com'
  },
  'vertex-google': {
    vendor: 'gcp', type: 'api', name: 'Google Vertex AI (Gemini)',
    configKeys: ['projectId', 'location', 'serviceAccountKey'],
    envKeys: ['GOOGLE_APPLICATION_CREDENTIALS', 'GOOGLE_CLOUD_PROJECT'],
    baseUrl: 'https://{location}-aiplatform.googleapis.com'
  },
  'azure': {
    vendor: 'microsoft', type: 'api', name: 'Azure OpenAI',
    configKeys: ['apiKey', 'endpoint', 'deploymentName'],
    envKeys: ['AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_ENDPOINT'],
    baseUrl: '{endpoint}'
  },

  // OTHER PROVIDERS
  'openrouter': {
    vendor: 'openrouter', type: 'api', name: 'OpenRouter',
    configKeys: ['apiKey'], envKeys: ['OPENROUTER_API_KEY'],
    baseUrl: 'https://openrouter.ai/api'
  },
  'github-copilot': {
    vendor: 'github', type: 'oauth', name: 'GitHub Copilot',
    configKeys: ['accessToken', 'refreshToken', 'expiresAt'],
    envKeys: ['GITHUB_TOKEN', 'GITHUB_COPILOT_TOKEN'],
    oauthConfig: {
      authUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      scopes: ['copilot'],
      redirectUri: 'http://localhost:19284/callback'
    },
    baseUrl: 'https://api.github.com'
  },
  'xai-subscription': {
    vendor: 'xai', type: 'subscription', name: 'X Premium+ (Grok)',
    configKeys: ['sessionToken'], envKeys: ['XAI_SESSION_TOKEN'],
    baseUrl: 'https://api.x.ai'
  },
  'xai-api': {
    vendor: 'xai', type: 'api', name: 'xAI API Key',
    configKeys: ['apiKey'], envKeys: ['XAI_API_KEY'],
    baseUrl: 'https://api.x.ai'
  },
  'together': {
    vendor: 'together', type: 'api', name: 'Together AI',
    configKeys: ['apiKey'], envKeys: ['TOGETHER_API_KEY'],
    baseUrl: 'https://api.together.xyz'
  },
  'groq': {
    vendor: 'groq', type: 'api', name: 'Groq',
    configKeys: ['apiKey'], envKeys: ['GROQ_API_KEY'],
    baseUrl: 'https://api.groq.com/openai'
  },
  'mistral-api': {
    vendor: 'mistral', type: 'api', name: 'Mistral AI',
    configKeys: ['apiKey'], envKeys: ['MISTRAL_API_KEY'],
    baseUrl: 'https://api.mistral.ai'
  },
  'deepseek-api': {
    vendor: 'deepseek', type: 'api', name: 'DeepSeek',
    configKeys: ['apiKey'], envKeys: ['DEEPSEEK_API_KEY'],
    baseUrl: 'https://api.deepseek.com'
  },
  'cohere-api': {
    vendor: 'cohere', type: 'api', name: 'Cohere',
    configKeys: ['apiKey'], envKeys: ['COHERE_API_KEY', 'CO_API_KEY'],
    baseUrl: 'https://api.cohere.ai'
  },
  'zai-coding-plan': {
    vendor: 'zai', type: 'api', name: 'ZAI Coding Plan (GLM)',
    configKeys: ['apiKey'], envKeys: ['ZAI_API_KEY', 'GLM_API_KEY'],
    baseUrl: 'https://api.zai.com'
  },
  'antigravity': {
    vendor: 'antigravity', type: 'api', name: 'Antigravity',
    configKeys: ['apiKey'], envKeys: ['ANTIGRAVITY_API_KEY'],
    baseUrl: 'https://api.antigravity.ai'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
}

export function loadAuthConfig() {
  ensureConfigDir();
  try {
    if (existsSync(AUTH_FILE)) return JSON.parse(readFileSync(AUTH_FILE, 'utf8'));
  } catch (e) { console.error('Error loading auth:', e.message); }
  return { providers: {}, defaultPreference: 'subscription' };
}

export function saveAuthConfig(config) {
  ensureConfigDir();
  writeFileSync(AUTH_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

function loadTokens() {
  ensureConfigDir();
  try {
    if (existsSync(TOKENS_FILE)) return JSON.parse(readFileSync(TOKENS_FILE, 'utf8'));
  } catch (e) {}
  return {};
}

function saveTokens(tokens) {
  ensureConfigDir();
  writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), { mode: 0o600 });
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════

export function isProviderConfigured(providerId) {
  const config = PROVIDER_AUTH_CONFIG[providerId];
  if (!config) return false;
  
  // Check environment variables
  for (const envKey of config.envKeys) {
    if (process.env[envKey]) return true;
  }
  
  // Check stored credentials
  const authConfig = loadAuthConfig();
  const providerAuth = authConfig.providers[providerId];
  if (!providerAuth) return false;
  
  for (const key of config.configKeys) {
    if (providerAuth[key]) return true;
  }
  
  return false;
}

// Alias for MCP compatibility
export const checkAuth = isProviderConfigured;

export function getProviderCredentials(providerId) {
  const config = PROVIDER_AUTH_CONFIG[providerId];
  if (!config) return null;
  
  const credentials = { type: config.type, providerId };
  
  // Load from environment
  for (const envKey of config.envKeys) {
    if (process.env[envKey]) {
      if (envKey.includes('API_KEY') || envKey.includes('SECRET')) {
        credentials.apiKey = process.env[envKey];
      } else if (envKey.includes('TOKEN')) {
        credentials.token = process.env[envKey];
      } else {
        credentials[envKey.toLowerCase().replace(/_/g, '')] = process.env[envKey];
      }
    }
  }
  
  // Load from stored config
  const authConfig = loadAuthConfig();
  const storedCreds = authConfig.providers[providerId] || {};
  for (const key of config.configKeys) {
    if (!credentials[key] && storedCreds[key]) {
      credentials[key] = storedCreds[key];
    }
  }
  
  // Check if OAuth needs refresh
  if (config.type === 'oauth' && credentials.expiresAt) {
    const expiresAt = new Date(credentials.expiresAt).getTime();
    const now = Date.now();
    const bufferMs = 5 * 60 * 1000; // 5 minutes buffer
    
    if (now > expiresAt - bufferMs) {
      credentials.needsRefresh = true;
      credentials.isExpired = now > expiresAt;
    }
  }
  
  return credentials;
}

export function getConfiguredProvidersByPriority(vendorFilter = null) {
  const configured = [];
  
  for (const [providerId, config] of Object.entries(PROVIDER_AUTH_CONFIG)) {
    if (vendorFilter && config.vendor !== vendorFilter) continue;
    if (!isProviderConfigured(providerId)) continue;
    
    configured.push({
      id: providerId,
      ...config,
      priority: AUTH_PRIORITY[config.type]
    });
  }
  
  return configured.sort((a, b) => b.priority - a.priority);
}

export function getBestProviderForVendor(vendor) {
  const providers = getConfiguredProvidersByPriority(vendor);
  return providers[0] || null;
}

export function setProviderCredentials(providerId, credentials) {
  const config = loadAuthConfig();
  config.providers[providerId] = {
    ...config.providers[providerId],
    ...credentials,
    updatedAt: new Date().toISOString()
  };
  saveAuthConfig(config);
}

export function removeProviderCredentials(providerId) {
  const config = loadAuthConfig();
  delete config.providers[providerId];
  saveAuthConfig(config);
}

// ═══════════════════════════════════════════════════════════════════════════
// OAUTH FLOW - TOKEN REFRESH
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Refresh OAuth tokens for a provider
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>} New credentials
 */
export async function refreshOAuthToken(providerId) {
  const config = PROVIDER_AUTH_CONFIG[providerId];
  if (!config || config.type !== 'oauth' || !config.oauthConfig) {
    throw new Error(`Provider ${providerId} does not support OAuth refresh`);
  }
  
  const credentials = getProviderCredentials(providerId);
  if (!credentials.refreshToken) {
    throw new Error(`No refresh token available for ${providerId}`);
  }
  
  const authConfig = loadAuthConfig();
  const storedCreds = authConfig.providers[providerId] || {};
  
  // Get client credentials
  const clientId = storedCreds.clientId || process.env[`${config.vendor.toUpperCase()}_CLIENT_ID`];
  const clientSecret = storedCreds.clientSecret || process.env[`${config.vendor.toUpperCase()}_CLIENT_SECRET`];
  
  if (!clientId || !clientSecret) {
    throw new Error(`Client credentials not found for ${providerId}`);
  }
  
  const tokenParams = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: credentials.refreshToken
  });
  
  return new Promise((resolve, reject) => {
    const tokenUrl = new URL(config.oauthConfig.tokenUrl);
    
    const req = httpsRequest({
      hostname: tokenUrl.hostname,
      path: tokenUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': tokenParams.toString().length,
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          
          const newCredentials = {
            accessToken: response.access_token,
            refreshToken: response.refresh_token || credentials.refreshToken, // Keep old if not returned
            expiresAt: new Date(Date.now() + (response.expires_in * 1000)).toISOString(),
            tokenType: response.token_type || 'Bearer',
            scope: response.scope,
            refreshedAt: new Date().toISOString()
          };
          
          // Save updated credentials
          setProviderCredentials(providerId, newCredentials);
          
          console.log(`[OAuth] Refreshed token for ${providerId}, expires: ${newCredentials.expiresAt}`);
          resolve(newCredentials);
        } catch (e) {
          reject(new Error(`Failed to parse token response: ${e.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Token refresh request failed: ${error.message}`));
    });
    
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Token refresh request timed out'));
    });
    
    req.write(tokenParams.toString());
    req.end();
  });
}

/**
 * Ensure provider has valid OAuth credentials, refresh if needed
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>} Valid credentials
 */
export async function ensureValidCredentials(providerId) {
  const credentials = getProviderCredentials(providerId);
  
  if (!credentials) {
    throw new Error(`Provider ${providerId} is not configured`);
  }
  
  // API keys don't expire
  if (credentials.type === 'api' || credentials.type === 'subscription') {
    return credentials;
  }
  
  // Check if OAuth token needs refresh
  if (credentials.needsRefresh && credentials.refreshToken) {
    console.log(`[OAuth] Token for ${providerId} needs refresh...`);
    
    try {
      const newCredentials = await refreshOAuthToken(providerId);
      return { ...credentials, ...newCredentials, needsRefresh: false };
    } catch (error) {
      console.error(`[OAuth] Failed to refresh token for ${providerId}:`, error.message);
      
      // If expired and refresh failed, throw
      if (credentials.isExpired) {
        throw new Error(`Token expired and refresh failed for ${providerId}: ${error.message}`);
      }
      
      // If not yet expired, return current credentials with warning
      console.warn(`[OAuth] Using potentially stale token for ${providerId}`);
      return credentials;
    }
  }
  
  return credentials;
}

/**
 * Schedule automatic token refresh before expiration
 * @param {string} providerId - Provider ID
 * @param {number} [bufferMinutes=10] - Minutes before expiration to refresh
 * @returns {NodeJS.Timeout|null} Timer ID or null
 */
export function scheduleTokenRefresh(providerId, bufferMinutes = 10) {
  const credentials = getProviderCredentials(providerId);
  
  if (!credentials || credentials.type !== 'oauth' || !credentials.expiresAt) {
    return null;
  }
  
  const expiresAt = new Date(credentials.expiresAt).getTime();
  const refreshAt = expiresAt - (bufferMinutes * 60 * 1000);
  const delay = refreshAt - Date.now();
  
  if (delay <= 0) {
    // Already needs refresh
    refreshOAuthToken(providerId).catch(err => {
      console.error(`[OAuth] Scheduled refresh failed for ${providerId}:`, err.message);
    });
    return null;
  }
  
  console.log(`[OAuth] Scheduled token refresh for ${providerId} in ${Math.round(delay / 60000)} minutes`);
  
  return setTimeout(async () => {
    try {
      await refreshOAuthToken(providerId);
      // Schedule next refresh
      scheduleTokenRefresh(providerId, bufferMinutes);
    } catch (error) {
      console.error(`[OAuth] Scheduled refresh failed for ${providerId}:`, error.message);
      // Retry in 1 minute
      setTimeout(() => scheduleTokenRefresh(providerId, bufferMinutes), 60000);
    }
  }, delay);
}

// ═══════════════════════════════════════════════════════════════════════════
// OAUTH FLOW - INITIAL AUTHORIZATION
// ═══════════════════════════════════════════════════════════════════════════

export function startOAuthFlow(providerId, clientId, clientSecret) {
  const config = PROVIDER_AUTH_CONFIG[providerId];
  if (!config || !config.oauthConfig) {
    throw new Error(`Provider ${providerId} does not support OAuth`);
  }
  
  const oauthConfig = config.oauthConfig;
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: oauthConfig.redirectUri,
    response_type: 'code',
    scope: oauthConfig.scopes.join(' '),
    state,
    access_type: 'offline',
    prompt: 'consent'
  });
  
  const authUrl = `${oauthConfig.authUrl}?${params.toString()}`;
  
  // Store OAuth state for verification
  const tokens = loadTokens();
  tokens[`oauth_state_${providerId}`] = {
    state,
    clientId,
    clientSecret,
    createdAt: Date.now()
  };
  saveTokens(tokens);
  
  return { authUrl, state };
}

export function startCallbackServer(providerId, port = 19284) {
  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${port}`);
      
      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        
        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`<html><body><h1>OAuth Error</h1><p>${error}</p><p>You can close this window.</p></body></html>`);
          server.close();
          reject(new Error(error));
          return;
        }
        
        try {
          const tokens = await exchangeCodeForTokens(providerId, code, state);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`<html><body><h1>Success!</h1><p>Authentication complete. You can close this window.</p></body></html>`);
          server.close();
          resolve(tokens);
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`<html><body><h1>Error</h1><p>${err.message}</p></body></html>`);
          server.close();
          reject(err);
        }
      }
    });
    
    server.listen(port, () => {
      console.log(`OAuth callback server listening on http://localhost:${port}/callback`);
    });
    
    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('OAuth timeout - no callback received'));
    }, 300000);
  });
}

export async function exchangeCodeForTokens(providerId, code, state) {
  const config = PROVIDER_AUTH_CONFIG[providerId];
  const storedTokens = loadTokens();
  const storedState = storedTokens[`oauth_state_${providerId}`];
  
  if (!storedState || storedState.state !== state) {
    throw new Error('Invalid OAuth state - possible CSRF attack');
  }
  
  const { clientId, clientSecret } = storedState;
  
  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: config.oauthConfig.redirectUri
  });
  
  return new Promise((resolve, reject) => {
    const tokenUrl = new URL(config.oauthConfig.tokenUrl);
    
    const req = httpsRequest({
      hostname: tokenUrl.hostname,
      path: tokenUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': tokenParams.toString().length,
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          
          const credentials = {
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            expiresAt: new Date(Date.now() + (response.expires_in * 1000)).toISOString(),
            tokenType: response.token_type || 'Bearer',
            scope: response.scope,
            clientId, // Store for refresh
            clientSecret,
            createdAt: new Date().toISOString()
          };
          
          setProviderCredentials(providerId, credentials);
          
          // Clean up OAuth state
          delete storedTokens[`oauth_state_${providerId}`];
          saveTokens(storedTokens);
          
          // Schedule automatic refresh
          scheduleTokenRefresh(providerId);
          
          resolve(credentials);
        } catch (e) {
          reject(new Error(`Failed to parse token response: ${e.message}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(tokenParams.toString());
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS & UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

export function getAuthStatus() {
  const status = {};
  
  for (const [providerId, config] of Object.entries(PROVIDER_AUTH_CONFIG)) {
    const configured = isProviderConfigured(providerId);
    const credentials = configured ? getProviderCredentials(providerId) : null;
    
    status[providerId] = {
      vendor: config.vendor,
      type: config.type,
      name: config.name,
      configured,
      priority: AUTH_PRIORITY[config.type],
      needsRefresh: credentials?.needsRefresh || false,
      isExpired: credentials?.isExpired || false,
      expiresAt: credentials?.expiresAt || null,
      hasRefreshToken: !!credentials?.refreshToken
    };
  }
  
  return status;
}

export function getProvidersByVendor() {
  const byVendor = {};
  
  for (const [providerId, config] of Object.entries(PROVIDER_AUTH_CONFIG)) {
    if (!byVendor[config.vendor]) byVendor[config.vendor] = [];
    
    byVendor[config.vendor].push({
      id: providerId,
      ...config,
      priority: AUTH_PRIORITY[config.type],
      configured: isProviderConfigured(providerId)
    });
  }
  
  // Sort by priority within each vendor
  for (const vendor of Object.keys(byVendor)) {
    byVendor[vendor].sort((a, b) => b.priority - a.priority);
  }
  
  return byVendor;
}

/**
 * Initialize OAuth refresh for all configured OAuth providers
 */
export function initializeOAuthRefresh() {
  for (const [providerId, config] of Object.entries(PROVIDER_AUTH_CONFIG)) {
    if (config.type === 'oauth' && isProviderConfigured(providerId)) {
      const credentials = getProviderCredentials(providerId);
      if (credentials?.refreshToken) {
        scheduleTokenRefresh(providerId);
      }
    }
  }
}

// Default export for CommonJS compatibility
export default {
  AUTH_PRIORITY,
  PROVIDER_AUTH_CONFIG,
  loadAuthConfig,
  saveAuthConfig,
  isProviderConfigured,
  checkAuth,
  getProviderCredentials,
  getConfiguredProvidersByPriority,
  getBestProviderForVendor,
  setProviderCredentials,
  removeProviderCredentials,
  refreshOAuthToken,
  ensureValidCredentials,
  scheduleTokenRefresh,
  startOAuthFlow,
  startCallbackServer,
  exchangeCodeForTokens,
  getAuthStatus,
  getProvidersByVendor,
  initializeOAuthRefresh
};
