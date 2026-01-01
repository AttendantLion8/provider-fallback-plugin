/**
 * Authentication Manager - OAuth, Subscription, and API key support
 * Priority: Subscription (100) > OAuth (50) > API (10)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const http = require('http');

const CONFIG_DIR = path.join(os.homedir(), '.claude', 'provider-fallback');
const AUTH_FILE = path.join(CONFIG_DIR, 'auth.json');
const TOKENS_FILE = path.join(CONFIG_DIR, 'tokens.json');

const AUTH_PRIORITY = { subscription: 100, oauth: 50, api: 10 };

const PROVIDER_AUTH_CONFIG = {
  // ANTHROPIC
  'anthropic-subscription': {
    vendor: 'anthropic', type: 'subscription', name: 'Anthropic Pro/Max Subscription',
    configKeys: ['sessionToken', 'organizationId'], envKeys: ['ANTHROPIC_SESSION_TOKEN'],
    baseUrl: 'https://api.anthropic.com'
  },
  'anthropic-oauth': {
    vendor: 'anthropic', type: 'oauth', name: 'Anthropic OAuth',
    configKeys: ['accessToken', 'refreshToken', 'expiresAt'], envKeys: [],
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
    configKeys: ['sessionToken', 'accessToken'], envKeys: ['OPENAI_SESSION_TOKEN'],
    baseUrl: 'https://api.openai.com'
  },
  'openai-oauth': {
    vendor: 'openai', type: 'oauth', name: 'OpenAI OAuth',
    configKeys: ['accessToken', 'refreshToken', 'expiresAt'], envKeys: [],
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
    configKeys: ['authToken', 'accountId'], envKeys: ['GOOGLE_AI_SESSION'],
    baseUrl: 'https://generativelanguage.googleapis.com'
  },
  'google-oauth': {
    vendor: 'google', type: 'oauth', name: 'Google OAuth (Antigravity-style)',
    configKeys: ['accessToken', 'refreshToken', 'expiresAt'], envKeys: [],
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
  }
};

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

function loadAuthConfig() {
  ensureConfigDir();
  try {
    if (fs.existsSync(AUTH_FILE)) return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
  } catch (e) { console.error('Error loading auth:', e.message); }
  return { providers: {}, defaultPreference: 'subscription' };
}

function saveAuthConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(AUTH_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

function loadTokens() {
  ensureConfigDir();
  try {
    if (fs.existsSync(TOKENS_FILE)) return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
  } catch (e) {}
  return {};
}

function saveTokens(tokens) {
  ensureConfigDir();
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), { mode: 0o600 });
}

function isProviderConfigured(providerId) {
  const config = PROVIDER_AUTH_CONFIG[providerId];
  if (!config) return false;
  for (const envKey of config.envKeys) {
    if (process.env[envKey]) return true;
  }
  const authConfig = loadAuthConfig();
  const providerAuth = authConfig.providers[providerId];
  if (!providerAuth) return false;
  for (const key of config.configKeys) {
    if (providerAuth[key]) return true;
  }
  return false;
}

function getProviderCredentials(providerId) {
  const config = PROVIDER_AUTH_CONFIG[providerId];
  if (!config) return null;
  const credentials = { type: config.type, providerId };
  for (const envKey of config.envKeys) {
    if (process.env[envKey]) {
      if (envKey.includes('API_KEY') || envKey.includes('SECRET')) credentials.apiKey = process.env[envKey];
      else if (envKey.includes('TOKEN')) credentials.token = process.env[envKey];
      else credentials[envKey.toLowerCase().replace(/_/g, '')] = process.env[envKey];
    }
  }
  const authConfig = loadAuthConfig();
  const storedCreds = authConfig.providers[providerId] || {};
  for (const key of config.configKeys) {
    if (!credentials[key] && storedCreds[key]) credentials[key] = storedCreds[key];
  }
  if (config.type === 'oauth' && credentials.expiresAt && Date.now() > credentials.expiresAt - 60000) {
    credentials.needsRefresh = true;
  }
  return credentials;
}

function getConfiguredProvidersByPriority(vendorFilter = null) {
  const configured = [];
  for (const [providerId, config] of Object.entries(PROVIDER_AUTH_CONFIG)) {
    if (vendorFilter && config.vendor !== vendorFilter) continue;
    if (!isProviderConfigured(providerId)) continue;
    configured.push({ id: providerId, ...config, priority: AUTH_PRIORITY[config.type] });
  }
  return configured.sort((a, b) => b.priority - a.priority);
}

function getBestProviderForVendor(vendor) {
  const providers = getConfiguredProvidersByPriority(vendor);
  return providers[0] || null;
}

function setProviderCredentials(providerId, credentials) {
  const config = loadAuthConfig();
  config.providers[providerId] = { ...config.providers[providerId], ...credentials, updatedAt: new Date().toISOString() };
  saveAuthConfig(config);
}

function removeProviderCredentials(providerId) {
  const config = loadAuthConfig();
  delete config.providers[providerId];
  saveAuthConfig(config);
}

function startOAuthFlow(providerId, clientId, clientSecret) {
  const config = PROVIDER_AUTH_CONFIG[providerId];
  if (!config || !config.oauthConfig) throw new Error(`Provider ${providerId} does not support OAuth`);
  const oauthConfig = config.oauthConfig;
  const state = Math.random().toString(36).substring(2, 15);
  const params = new URLSearchParams({
    client_id: clientId, redirect_uri: oauthConfig.redirectUri, response_type: 'code',
    scope: oauthConfig.scopes.join(' '), state, access_type: 'offline', prompt: 'consent'
  });
  const authUrl = `${oauthConfig.authUrl}?${params.toString()}`;
  const tokens = loadTokens();
  tokens[`oauth_state_${providerId}`] = { state, clientId, clientSecret, createdAt: Date.now() };
  saveTokens(tokens);
  return { authUrl, state };
}

function startCallbackServer(providerId, port = 19284) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${port}`);
      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`<html><body><h1>OAuth Error</h1><p>${error}</p></body></html>`);
          server.close(); reject(new Error(error)); return;
        }
        try {
          const tokens = await exchangeCodeForTokens(providerId, code, state);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`<html><body><h1>Success!</h1><p>You can close this window.</p></body></html>`);
          server.close(); resolve(tokens);
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`<html><body><h1>Error</h1><p>${err.message}</p></body></html>`);
          server.close(); reject(err);
        }
      }
    });
    server.listen(port, () => console.log(`OAuth callback: http://localhost:${port}/callback`));
    setTimeout(() => { server.close(); reject(new Error('OAuth timeout')); }, 300000);
  });
}

async function exchangeCodeForTokens(providerId, code, state) {
  const config = PROVIDER_AUTH_CONFIG[providerId];
  const storedTokens = loadTokens();
  const storedState = storedTokens[`oauth_state_${providerId}`];
  if (!storedState || storedState.state !== state) throw new Error('Invalid OAuth state');
  const { clientId, clientSecret } = storedState;
  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code', client_id: clientId, client_secret: clientSecret,
    code, redirect_uri: config.oauthConfig.redirectUri
  });
  return new Promise((resolve, reject) => {
    const tokenUrl = new URL(config.oauthConfig.tokenUrl);
    const req = https.request({
      hostname: tokenUrl.hostname, path: tokenUrl.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': tokenParams.toString().length }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) { reject(new Error(response.error_description || response.error)); return; }
          const credentials = {
            accessToken: response.access_token, refreshToken: response.refresh_token,
            expiresAt: Date.now() + (response.expires_in * 1000), tokenType: response.token_type
          };
          setProviderCredentials(providerId, credentials);
          delete storedTokens[`oauth_state_${providerId}`];
          saveTokens(storedTokens);
          resolve(credentials);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(tokenParams.toString());
    req.end();
  });
}

function getAuthStatus() {
  const status = {};
  for (const [providerId, config] of Object.entries(PROVIDER_AUTH_CONFIG)) {
    const configured = isProviderConfigured(providerId);
    const credentials = configured ? getProviderCredentials(providerId) : null;
    status[providerId] = {
      vendor: config.vendor, type: config.type, name: config.name, configured,
      priority: AUTH_PRIORITY[config.type], needsRefresh: credentials?.needsRefresh || false,
      expiresAt: credentials?.expiresAt || null
    };
  }
  return status;
}

function getProvidersByVendor() {
  const byVendor = {};
  for (const [providerId, config] of Object.entries(PROVIDER_AUTH_CONFIG)) {
    if (!byVendor[config.vendor]) byVendor[config.vendor] = [];
    byVendor[config.vendor].push({
      id: providerId, ...config, priority: AUTH_PRIORITY[config.type],
      configured: isProviderConfigured(providerId)
    });
  }
  for (const vendor of Object.keys(byVendor)) byVendor[vendor].sort((a, b) => b.priority - a.priority);
  return byVendor;
}

module.exports = {
  AUTH_PRIORITY, PROVIDER_AUTH_CONFIG,
  loadAuthConfig, saveAuthConfig, isProviderConfigured, getProviderCredentials,
  getConfiguredProvidersByPriority, getBestProviderForVendor,
  setProviderCredentials, removeProviderCredentials,
  startOAuthFlow, startCallbackServer, exchangeCodeForTokens,
  getAuthStatus, getProvidersByVendor
};
