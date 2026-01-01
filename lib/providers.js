/**
 * Provider Fallback Plugin - Core Library
 * 
 * Manages provider priorities and automatic fallback when usage limits are reached.
 * Integrates with MODEL_REGISTRY from models.js for complete provider support.
 * @version 2.3.0
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { MODEL_REGISTRY, getProvidersForModel, getProviderModelId } from './models.js';

// Configuration file location
const CONFIG_DIR = join(homedir(), '.opencode', 'provider-fallback');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const USAGE_FILE = join(CONFIG_DIR, 'usage.json');

/**
 * All supported providers with metadata and auth detection
 */
const PROVIDERS = {
  // Anthropic Providers
  'anthropic-subscription': {
    name: 'Anthropic Subscription (Max/Pro)',
    priority: 100,
    envKeys: ['ANTHROPIC_SUBSCRIPTION_KEY', 'CLAUDE_SUBSCRIPTION'],
    authType: 'subscription',
    rateLimit: { rpm: 1000, tpd: 5000000 }
  },
  'anthropic-oauth': {
    name: 'Anthropic OAuth',
    priority: 50,
    envKeys: ['ANTHROPIC_OAUTH_TOKEN'],
    authType: 'oauth',
    rateLimit: { rpm: 500, tpd: 1000000 }
  },
  'anthropic-api': {
    name: 'Anthropic API',
    priority: 10,
    envKeys: ['ANTHROPIC_API_KEY'],
    authType: 'api',
    rateLimit: { rpm: 1000, tpd: 10000000 }
  },

  // OpenAI Providers
  'openai-subscription': {
    name: 'OpenAI Plus/Pro',
    priority: 100,
    envKeys: ['OPENAI_SUBSCRIPTION_KEY', 'OPENAI_PLUS'],
    authType: 'subscription',
    rateLimit: { rpm: 500, tpd: 3000000 }
  },
  'openai-oauth': {
    name: 'OpenAI OAuth',
    priority: 50,
    envKeys: ['OPENAI_OAUTH_TOKEN'],
    authType: 'oauth',
    rateLimit: { rpm: 200, tpd: 500000 }
  },
  'openai-api': {
    name: 'OpenAI API',
    priority: 10,
    envKeys: ['OPENAI_API_KEY'],
    authType: 'api',
    rateLimit: { rpm: 10000, tpd: 100000000 }
  },

  // Google Providers
  'google-subscription': {
    name: 'Google One AI Premium',
    priority: 100,
    envKeys: ['GOOGLE_AI_SUBSCRIPTION', 'GOOGLE_ONE_AI'],
    authType: 'subscription',
    rateLimit: { rpm: 60, tpd: 1500000 }
  },
  'google-oauth': {
    name: 'Google OAuth',
    priority: 50,
    envKeys: ['GOOGLE_OAUTH_TOKEN', 'GOOGLE_ACCESS_TOKEN'],
    authType: 'oauth',
    rateLimit: { rpm: 60, tpd: 500000 }
  },
  'google-api': {
    name: 'Google AI Studio API',
    priority: 10,
    envKeys: ['GOOGLE_API_KEY', 'GEMINI_API_KEY'],
    authType: 'api',
    rateLimit: { rpm: 1500, tpd: 50000000 }
  },

  // Cloud Providers
  'bedrock': {
    name: 'AWS Bedrock',
    priority: 40,
    envKeys: ['AWS_ACCESS_KEY_ID', 'AWS_BEDROCK_ACCESS_KEY'],
    authType: 'api',
    rateLimit: { rpm: 1000, tpd: 50000000 }
  },
  'vertex': {
    name: 'Google Vertex AI (Claude)',
    priority: 40,
    envKeys: ['GOOGLE_APPLICATION_CREDENTIALS', 'VERTEX_AI_KEY'],
    authType: 'api',
    rateLimit: { rpm: 1000, tpd: 50000000 }
  },
  'vertex-google': {
    name: 'Google Vertex AI (Gemini)',
    priority: 40,
    envKeys: ['GOOGLE_APPLICATION_CREDENTIALS', 'VERTEX_AI_KEY'],
    authType: 'api',
    rateLimit: { rpm: 1000, tpd: 50000000 }
  },
  'azure': {
    name: 'Azure OpenAI',
    priority: 40,
    envKeys: ['AZURE_OPENAI_API_KEY', 'AZURE_API_KEY'],
    authType: 'api',
    rateLimit: { rpm: 1000, tpd: 50000000 }
  },

  // Aggregators
  'openrouter': {
    name: 'OpenRouter',
    priority: 20,
    envKeys: ['OPENROUTER_API_KEY'],
    authType: 'api',
    rateLimit: { rpm: 500, tpd: 20000000 }
  },
  'together': {
    name: 'Together AI',
    priority: 15,
    envKeys: ['TOGETHER_API_KEY'],
    authType: 'api',
    rateLimit: { rpm: 600, tpd: 10000000 }
  },
  'groq': {
    name: 'Groq',
    priority: 15,
    envKeys: ['GROQ_API_KEY'],
    authType: 'api',
    rateLimit: { rpm: 30, tpd: 500000 }
  },

  // Specialty Providers
  'github-copilot': {
    name: 'GitHub Copilot',
    priority: 80,
    envKeys: ['GITHUB_COPILOT_TOKEN', 'GITHUB_TOKEN'],
    authType: 'subscription',
    rateLimit: { rpm: 100, tpd: 2000000 }
  },
  'xai-subscription': {
    name: 'xAI Subscription',
    priority: 100,
    envKeys: ['XAI_SUBSCRIPTION_KEY'],
    authType: 'subscription',
    rateLimit: { rpm: 60, tpd: 1000000 }
  },
  'xai-api': {
    name: 'xAI API',
    priority: 10,
    envKeys: ['XAI_API_KEY'],
    authType: 'api',
    rateLimit: { rpm: 60, tpd: 10000000 }
  },
  'mistral-api': {
    name: 'Mistral API',
    priority: 10,
    envKeys: ['MISTRAL_API_KEY'],
    authType: 'api',
    rateLimit: { rpm: 100, tpd: 10000000 }
  },
  'deepseek-api': {
    name: 'DeepSeek API',
    priority: 10,
    envKeys: ['DEEPSEEK_API_KEY'],
    authType: 'api',
    rateLimit: { rpm: 60, tpd: 5000000 }
  },
  'cohere-api': {
    name: 'Cohere API',
    priority: 10,
    envKeys: ['COHERE_API_KEY'],
    authType: 'api',
    rateLimit: { rpm: 100, tpd: 5000000 }
  },
  'zai-coding-plan': {
    name: 'Z.AI Coding Plan (GLM)',
    priority: 90,
    envKeys: ['ZAI_API_KEY', 'GLM_API_KEY'],
    authType: 'subscription',
    rateLimit: { rpm: 60, tpd: 5000000 }
  },
  'antigravity': {
    name: 'Antigravity AI',
    priority: 30,
    envKeys: ['ANTIGRAVITY_API_KEY'],
    authType: 'api',
    rateLimit: { rpm: 100, tpd: 10000000 }
  },
  'opencode-antigravity-auth': {
    name: 'OpenCode Antigravity Auth',
    priority: 95,
    envKeys: ['OPENCODE_ANTIGRAVITY_TOKEN', 'ANTIGRAVITY_AUTH_TOKEN', 'OC_ANTIGRAVITY_KEY'],
    authType: 'subscription',
    rateLimit: { rpm: 200, tpd: 10000000 }
  }
};

/**
 * Default provider priority order (subscription > oauth > api > aggregators)
 */
const DEFAULT_PROVIDER_PRIORITY = [
  'anthropic-subscription',
  'openai-subscription',
  'google-subscription',
  'xai-subscription',
  'opencode-antigravity-auth',
  'zai-coding-plan',
  'github-copilot',
  'anthropic-oauth',
  'openai-oauth',
  'google-oauth',
  'bedrock',
  'vertex',
  'vertex-google',
  'azure',
  'antigravity',
  'openrouter',
  'together',
  'groq',
  'anthropic-api',
  'openai-api',
  'google-api',
  'xai-api',
  'mistral-api',
  'deepseek-api',
  'cohere-api'
];

/**
 * Default configuration structure
 */
const DEFAULT_CONFIG = {
  version: 2,
  defaultModel: 'claude-4-sonnet',
  providerPriority: DEFAULT_PROVIDER_PRIORITY,
  usageLimits: Object.fromEntries(
    Object.entries(PROVIDERS).map(([id, p]) => [id, {
      dailyTokens: p.rateLimit.tpd,
      monthlyTokens: p.rateLimit.tpd * 30
    }])
  ),
  autoSwitch: true,
  notifyOnSwitch: true
};

/**
 * Default usage tracking structure
 */
function createDefaultUsage() {
  return {
    version: 2,
    lastReset: {
      daily: new Date().toISOString().split('T')[0],
      monthly: new Date().toISOString().slice(0, 7)
    },
    providers: Object.fromEntries(
      Object.keys(PROVIDERS).map(id => [id, { dailyTokens: 0, monthlyTokens: 0 }])
    )
  };
}

/**
 * Ensure config directory exists
 */
function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Load configuration
 */
function loadConfig() {
  ensureConfigDir();
  try {
    if (existsSync(CONFIG_FILE)) {
      const data = readFileSync(CONFIG_FILE, 'utf8');
      const loaded = JSON.parse(data);
      // Merge with defaults for any missing providers
      return { ...DEFAULT_CONFIG, ...loaded };
    }
  } catch (error) {
    console.error('Error loading config:', error.message);
  }
  return { ...DEFAULT_CONFIG };
}

/**
 * Save configuration
 */
function saveConfig(config) {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/**
 * Load usage data
 */
function loadUsage() {
  ensureConfigDir();
  try {
    if (existsSync(USAGE_FILE)) {
      const data = readFileSync(USAGE_FILE, 'utf8');
      const usage = JSON.parse(data);
      
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7);
      
      // Reset daily counters
      if (usage.lastReset.daily !== today) {
        Object.keys(usage.providers).forEach(provider => {
          usage.providers[provider].dailyTokens = 0;
        });
        usage.lastReset.daily = today;
      }
      
      // Reset monthly counters
      if (usage.lastReset.monthly !== thisMonth) {
        Object.keys(usage.providers).forEach(provider => {
          usage.providers[provider].monthlyTokens = 0;
        });
        usage.lastReset.monthly = thisMonth;
      }
      
      // Add any new providers
      for (const provider of Object.keys(PROVIDERS)) {
        if (!usage.providers[provider]) {
          usage.providers[provider] = { dailyTokens: 0, monthlyTokens: 0 };
        }
      }
      
      return usage;
    }
  } catch (error) {
    console.error('Error loading usage:', error.message);
  }
  return createDefaultUsage();
}

/**
 * Save usage data
 */
function saveUsage(usage) {
  ensureConfigDir();
  writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2));
}

/**
 * Check if a provider is authenticated
 */
function isProviderAuthenticated(providerId) {
  const provider = PROVIDERS[providerId];
  if (!provider) return false;
  return provider.envKeys.some(key => !!process.env[key]);
}

/**
 * Check if provider has available capacity
 */
function hasCapacity(provider, config, usage) {
  const limits = config.usageLimits[provider];
  const used = usage.providers[provider];
  
  if (!limits || !used) return true;
  
  return used.dailyTokens < limits.dailyTokens && 
         used.monthlyTokens < limits.monthlyTokens;
}

/**
 * Get the next available provider for a model based on priority
 */
function getNextProvider(model, config, usage) {
  const modelEntry = MODEL_REGISTRY[model];
  if (!modelEntry) return null;
  
  const availableProviders = Object.keys(modelEntry.providers || {});
  
  for (const provider of config.providerPriority) {
    // Check if provider supports the model
    if (!availableProviders.includes(provider)) continue;
    
    // Check if provider is authenticated
    if (!isProviderAuthenticated(provider)) continue;
    
    // Check if provider has capacity
    if (hasCapacity(provider, config, usage)) {
      return provider;
    }
  }
  return null;
}

/**
 * Get provider-specific model identifier
 */
function getProviderModel(baseModel, provider) {
  const modelEntry = MODEL_REGISTRY[baseModel];
  if (!modelEntry || !modelEntry.providers) return baseModel;
  return modelEntry.providers[provider] || baseModel;
}

/**
 * Record usage for a provider
 */
function recordUsage(provider, tokens) {
  const usage = loadUsage();
  if (usage.providers[provider]) {
    usage.providers[provider].dailyTokens += tokens;
    usage.providers[provider].monthlyTokens += tokens;
    saveUsage(usage);
  }
}

/**
 * Set provider priority order
 */
function setProviderPriority(priorityList) {
  const config = loadConfig();
  config.providerPriority = priorityList;
  saveConfig(config);
  return config;
}

/**
 * Set usage limit for a provider
 */
function setUsageLimit(provider, dailyTokens, monthlyTokens) {
  const config = loadConfig();
  if (!config.usageLimits[provider]) {
    config.usageLimits[provider] = {};
  }
  if (dailyTokens !== undefined) {
    config.usageLimits[provider].dailyTokens = dailyTokens;
  }
  if (monthlyTokens !== undefined) {
    config.usageLimits[provider].monthlyTokens = monthlyTokens;
  }
  saveConfig(config);
  return config;
}

/**
 * Get current status report
 */
function getStatus() {
  const config = loadConfig();
  const usage = loadUsage();
  
  const status = {
    defaultModel: config.defaultModel,
    providerPriority: config.providerPriority,
    autoSwitch: config.autoSwitch,
    providers: {}
  };
  
  for (const [providerId, provider] of Object.entries(PROVIDERS)) {
    const limits = config.usageLimits[providerId] || { dailyTokens: 0, monthlyTokens: 0 };
    const used = usage.providers[providerId] || { dailyTokens: 0, monthlyTokens: 0 };
    const isAuth = isProviderAuthenticated(providerId);
    
    status.providers[providerId] = {
      name: provider.name,
      authType: provider.authType,
      configured: isAuth,
      priority: config.providerPriority.indexOf(providerId) + 1 || 'Not in priority list',
      usage: {
        daily: `${used.dailyTokens.toLocaleString()} / ${limits.dailyTokens.toLocaleString()}`,
        monthly: `${used.monthlyTokens.toLocaleString()} / ${limits.monthlyTokens.toLocaleString()}`
      },
      available: isAuth && hasCapacity(providerId, config, usage)
    };
  }
  
  return status;
}

/**
 * Reset usage counters
 */
function resetUsage(provider = null) {
  const usage = loadUsage();
  
  if (provider) {
    if (usage.providers[provider]) {
      usage.providers[provider] = { dailyTokens: 0, monthlyTokens: 0 };
    }
  } else {
    Object.keys(usage.providers).forEach(p => {
      usage.providers[p] = { dailyTokens: 0, monthlyTokens: 0 };
    });
  }
  
  saveUsage(usage);
  return usage;
}

/**
 * Get all providers that support a specific model
 */
function getProvidersForModelWithStatus(model) {
  const modelEntry = MODEL_REGISTRY[model];
  if (!modelEntry || !modelEntry.providers) return [];
  
  const config = loadConfig();
  const usage = loadUsage();
  
  return Object.keys(modelEntry.providers).map(providerId => ({
    id: providerId,
    name: PROVIDERS[providerId]?.name || providerId,
    modelId: modelEntry.providers[providerId],
    authenticated: isProviderAuthenticated(providerId),
    hasCapacity: hasCapacity(providerId, config, usage),
    priority: config.providerPriority.indexOf(providerId) + 1
  })).sort((a, b) => a.priority - b.priority);
}

/**
 * List all available models grouped by family
 */
function listModels() {
  const families = {};
  
  for (const [modelId, model] of Object.entries(MODEL_REGISTRY)) {
    const family = model.family || 'other';
    if (!families[family]) families[family] = [];
    
    families[family].push({
      id: modelId,
      capabilities: model.capabilities,
      contextWindow: model.contextWindow,
      providerCount: Object.keys(model.providers || {}).length
    });
  }
  
  return families;
}

// ═══════════════════════════════════════════════════════════════════════════
// MCP-COMPATIBLE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all providers as an array (MCP-compatible)
 */
export function getProviders() {
  return Object.entries(PROVIDERS).map(([id, provider]) => ({
    id,
    ...provider,
    authenticated: isProviderAuthenticated(id)
  }));
}

/**
 * Get current active provider (highest priority with auth)
 */
export function getActiveProvider() {
  const config = loadConfig();
  for (const providerId of config.providerPriority) {
    if (isProviderAuthenticated(providerId)) {
      return { id: providerId, ...PROVIDERS[providerId] };
    }
  }
  return null;
}

/**
 * Set active provider by moving it to top of priority
 */
export function setActiveProvider(providerId) {
  if (!PROVIDERS[providerId]) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  const config = loadConfig();
  const newPriority = [providerId, ...config.providerPriority.filter(p => p !== providerId)];
  config.providerPriority = newPriority;
  saveConfig(config);
  return { id: providerId, ...PROVIDERS[providerId] };
}

/**
 * Get providers grouped by vendor family
 */
export function getProvidersByFamily(family) {
  const familyMap = {
    anthropic: ['anthropic-subscription', 'anthropic-oauth', 'anthropic-api'],
    openai: ['openai-subscription', 'openai-oauth', 'openai-api'],
    google: ['google-subscription', 'google-oauth', 'google-api', 'vertex-google'],
    cloud: ['bedrock', 'vertex', 'azure'],
    xai: ['xai-subscription', 'xai-api'],
    aggregator: ['openrouter', 'together', 'groq'],
    specialty: ['github-copilot', 'mistral-api', 'deepseek-api', 'cohere-api', 'zai-coding-plan', 'antigravity', 'opencode-antigravity-auth']
  };
  
  const providerIds = familyMap[family] || [];
  return providerIds
    .filter(id => PROVIDERS[id])
    .map(id => ({ id, ...PROVIDERS[id], authenticated: isProviderAuthenticated(id) }));
}

/**
 * Get provider by ID (MCP-compatible)
 */
export function getProviderById(providerId) {
  const provider = PROVIDERS[providerId];
  return provider ? { id: providerId, ...provider, authenticated: isProviderAuthenticated(providerId) } : null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  PROVIDERS,
  DEFAULT_PROVIDER_PRIORITY,
  loadConfig,
  saveConfig,
  loadUsage,
  saveUsage,
  isProviderAuthenticated,
  hasCapacity,
  getNextProvider,
  getProviderModel,
  recordUsage,
  setProviderPriority,
  setUsageLimit,
  getStatus,
  resetUsage,
  getProvidersForModelWithStatus,
  listModels,
  CONFIG_DIR,
  CONFIG_FILE,
  USAGE_FILE
};

// Default export for convenience
export default {
  PROVIDERS,
  DEFAULT_PROVIDER_PRIORITY,
  loadConfig,
  saveConfig,
  loadUsage,
  saveUsage,
  isProviderAuthenticated,
  hasCapacity,
  getNextProvider,
  getProviderModel,
  recordUsage,
  setProviderPriority,
  setUsageLimit,
  getStatus,
  resetUsage,
  getProvidersForModelWithStatus,
  listModels,
  getProviders,
  getActiveProvider,
  setActiveProvider,
  getProvidersByFamily,
  getProviderById,
  CONFIG_DIR,
  CONFIG_FILE,
  USAGE_FILE
};
