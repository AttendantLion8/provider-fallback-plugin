/**
 * Setup Wizard - Interactive provider configuration
 * Guides users through complete plugin setup
 * @version 2.5.0
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { PROVIDER_AUTH_CONFIG, setProviderCredentials, isProviderConfigured, getAuthStatus } from './auth.js';
import { PROVIDERS, DEFAULT_PROVIDER_PRIORITY, loadConfig, saveConfig } from './providers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_DIR = join(homedir(), '.opencode', 'provider-fallback');
const OPENCODE_CONFIG = join(homedir(), '.config', 'opencode', 'opencode.json');

// ═══════════════════════════════════════════════════════════════════════════
// ADDON PLUGIN DETECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Known addon plugins that provide additional agents/providers
 */
const ADDON_PLUGINS = {
  'oh-my-opencode': {
    name: 'Oh My OpenCode',
    description: 'Enhanced OpenCode experience with additional agents',
    agents: ['Planner-Sisyphus', 'oracle', 'librarian', 'explore'],
    providers: []
  },
  'opencode-openai-codex-auth': {
    name: 'OpenAI Codex Auth',
    description: 'OpenAI authentication integration',
    agents: [],
    providers: ['openai-codex']
  },
  'opencode-antigravity-auth': {
    name: 'Antigravity Auth',
    description: 'Antigravity authentication for OpenCode',
    agents: [],
    providers: ['opencode-antigravity-auth']
  },
  '@tarquinen/opencode-dcp': {
    name: 'DCP Plugin',
    description: 'Distributed Computing Protocol',
    agents: [],
    providers: []
  },
  'opencode-pty': {
    name: 'PTY Plugin',
    description: 'Pseudo-terminal support',
    agents: [],
    providers: []
  },
  '@franlol/opencode-md-table-formatter': {
    name: 'MD Table Formatter',
    description: 'Markdown table formatting',
    agents: [],
    providers: []
  }
};

/**
 * Detect installed OpenCode plugins
 */
export function detectInstalledPlugins() {
  const installed = [];
  
  try {
    if (existsSync(OPENCODE_CONFIG)) {
      const config = JSON.parse(readFileSync(OPENCODE_CONFIG, 'utf8'));
      const plugins = config.plugin || [];
      
      for (const plugin of plugins) {
        // Extract plugin name (remove version suffix)
        const pluginName = plugin.replace(/@[\d.]+$/, '').replace(/@latest$/, '');
        
        if (ADDON_PLUGINS[pluginName]) {
          installed.push({
            id: pluginName,
            ...ADDON_PLUGINS[pluginName],
            version: plugin.includes('@') ? plugin.split('@').pop() : 'latest'
          });
        } else {
          // Unknown plugin
          installed.push({
            id: pluginName,
            name: pluginName,
            description: 'Third-party plugin',
            agents: [],
            providers: [],
            version: plugin.includes('@') ? plugin.split('@').pop() : 'unknown'
          });
        }
      }
    }
  } catch (e) {
    // Ignore errors
  }
  
  return installed;
}

/**
 * Get all available agents including from addon plugins
 */
export function getAllAvailableAgents() {
  const baseAgents = [
    { id: 'build', name: 'Build Agent', source: 'opencode-core', description: 'Build and compile projects' },
    { id: 'plan', name: 'Plan Agent', source: 'opencode-core', description: 'Create implementation plans' },
    { id: 'general', name: 'General Agent', source: 'opencode-core', description: 'General-purpose tasks' },
    { id: 'explore', name: 'Explore Agent', source: 'opencode-core', description: 'Codebase exploration' },
    { id: 'oracle', name: 'Oracle Agent', source: 'opencode-core', description: 'Technical advisor' },
    { id: 'librarian', name: 'Librarian Agent', source: 'opencode-core', description: 'Documentation lookup' }
  ];
  
  const plugins = detectInstalledPlugins();
  const addonAgents = [];
  
  for (const plugin of plugins) {
    for (const agent of plugin.agents) {
      addonAgents.push({
        id: agent,
        name: agent,
        source: plugin.id,
        description: `Agent from ${plugin.name}`
      });
    }
  }
  
  return [...baseAgents, ...addonAgents];
}

// ═══════════════════════════════════════════════════════════════════════════
// ENVIRONMENT DETECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detect all configured credentials from environment variables
 */
export function detectEnvironmentCredentials() {
  const detected = {};
  
  for (const [providerId, config] of Object.entries(PROVIDER_AUTH_CONFIG)) {
    const foundEnvs = [];
    
    for (const envKey of config.envKeys) {
      if (process.env[envKey]) {
        foundEnvs.push({
          key: envKey,
          value: maskCredential(process.env[envKey]),
          rawLength: process.env[envKey].length
        });
      }
    }
    
    if (foundEnvs.length > 0) {
      detected[providerId] = {
        ...config,
        detectedFrom: foundEnvs,
        configured: true
      };
    }
  }
  
  return detected;
}

/**
 * Mask credential for display (show first/last 4 chars)
 */
function maskCredential(value) {
  if (!value || value.length < 12) return '***';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// SETUP STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get current setup state
 */
export function getSetupState() {
  const authStatus = getAuthStatus();
  const envCredentials = detectEnvironmentCredentials();
  const plugins = detectInstalledPlugins();
  const config = loadConfig();
  
  // Categorize providers by configuration status
  const configured = [];
  const unconfigured = [];
  const fromEnv = [];
  
  for (const [providerId, providerConfig] of Object.entries(PROVIDER_AUTH_CONFIG)) {
    const status = authStatus[providerId] || {};
    const envCred = envCredentials[providerId];
    
    const entry = {
      id: providerId,
      name: providerConfig.name,
      vendor: providerConfig.vendor,
      type: providerConfig.type,
      configured: status.configured || false
    };
    
    if (envCred) {
      entry.source = 'environment';
      entry.envKeys = envCred.detectedFrom.map(e => e.key);
      fromEnv.push(entry);
    } else if (status.configured) {
      entry.source = 'config';
      configured.push(entry);
    } else {
      unconfigured.push(entry);
    }
  }
  
  return {
    configured,
    unconfigured,
    fromEnv,
    plugins,
    currentPriority: config.providerPriority,
    autoSwitch: config.autoSwitch
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER GROUPS FOR SETUP WIZARD
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get providers grouped by vendor for wizard display
 */
export function getProviderGroups() {
  const groups = {
    anthropic: {
      name: 'Anthropic (Claude)',
      description: 'Claude AI models from Anthropic',
      providers: []
    },
    openai: {
      name: 'OpenAI',
      description: 'GPT and other OpenAI models',
      providers: []
    },
    google: {
      name: 'Google',
      description: 'Gemini and Google AI models',
      providers: []
    },
    cloud: {
      name: 'Cloud Providers',
      description: 'AWS Bedrock, Google Vertex AI, Azure',
      providers: []
    },
    xai: {
      name: 'xAI (Grok)',
      description: 'Grok models from X',
      providers: []
    },
    aggregators: {
      name: 'Aggregators',
      description: 'Multi-model routers (OpenRouter, Together, Groq)',
      providers: []
    },
    specialty: {
      name: 'Specialty Providers',
      description: 'GitHub Copilot, Mistral, DeepSeek, etc.',
      providers: []
    }
  };
  
  const vendorToGroup = {
    anthropic: 'anthropic',
    openai: 'openai',
    google: 'google',
    aws: 'cloud',
    gcp: 'cloud',
    microsoft: 'cloud',
    xai: 'xai',
    openrouter: 'aggregators',
    together: 'aggregators',
    groq: 'aggregators',
    github: 'specialty',
    mistral: 'specialty',
    deepseek: 'specialty',
    cohere: 'specialty',
    zai: 'specialty',
    antigravity: 'specialty',
    opencode: 'specialty'
  };
  
  for (const [providerId, config] of Object.entries(PROVIDER_AUTH_CONFIG)) {
    const groupId = vendorToGroup[config.vendor] || 'specialty';
    const isConfigured = isProviderConfigured(providerId);
    
    groups[groupId].providers.push({
      id: providerId,
      name: config.name,
      type: config.type,
      configured: isConfigured,
      envKeys: config.envKeys,
      configKeys: config.configKeys
    });
  }
  
  // Sort providers within each group by priority (subscription > oauth > api)
  const typePriority = { subscription: 0, oauth: 1, api: 2 };
  for (const group of Object.values(groups)) {
    group.providers.sort((a, b) => (typePriority[a.type] || 3) - (typePriority[b.type] || 3));
  }
  
  return groups;
}

// ═══════════════════════════════════════════════════════════════════════════
// CREDENTIAL SETUP HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get required fields for a provider
 */
export function getProviderRequiredFields(providerId) {
  const config = PROVIDER_AUTH_CONFIG[providerId];
  if (!config) return null;
  
  const fields = [];
  
  switch (config.type) {
    case 'subscription':
      fields.push({
        key: 'sessionToken',
        label: 'Session Token',
        description: `Your ${config.name} session token`,
        sensitive: true,
        envHint: config.envKeys[0]
      });
      break;
      
    case 'oauth':
      fields.push(
        {
          key: 'clientId',
          label: 'OAuth Client ID',
          description: 'OAuth 2.0 Client ID',
          sensitive: false,
          envHint: `${config.vendor.toUpperCase()}_CLIENT_ID`
        },
        {
          key: 'clientSecret',
          label: 'OAuth Client Secret',
          description: 'OAuth 2.0 Client Secret',
          sensitive: true,
          envHint: `${config.vendor.toUpperCase()}_CLIENT_SECRET`
        }
      );
      break;
      
    case 'api':
      if (providerId === 'bedrock') {
        fields.push(
          { key: 'accessKeyId', label: 'AWS Access Key ID', sensitive: true, envHint: 'AWS_ACCESS_KEY_ID' },
          { key: 'secretAccessKey', label: 'AWS Secret Access Key', sensitive: true, envHint: 'AWS_SECRET_ACCESS_KEY' },
          { key: 'region', label: 'AWS Region', sensitive: false, envHint: 'AWS_REGION', default: 'us-east-1' }
        );
      } else if (providerId === 'vertex' || providerId === 'vertex-google') {
        fields.push(
          { key: 'projectId', label: 'GCP Project ID', sensitive: false, envHint: 'GOOGLE_CLOUD_PROJECT' },
          { key: 'location', label: 'GCP Location', sensitive: false, default: 'us-central1' },
          { key: 'serviceAccountKey', label: 'Service Account Key Path', sensitive: false, envHint: 'GOOGLE_APPLICATION_CREDENTIALS' }
        );
      } else if (providerId === 'azure') {
        fields.push(
          { key: 'apiKey', label: 'Azure OpenAI API Key', sensitive: true, envHint: 'AZURE_OPENAI_API_KEY' },
          { key: 'endpoint', label: 'Azure Endpoint URL', sensitive: false, envHint: 'AZURE_OPENAI_ENDPOINT' },
          { key: 'deploymentName', label: 'Deployment Name', sensitive: false }
        );
      } else {
        fields.push({
          key: 'apiKey',
          label: 'API Key',
          description: `Your ${config.name} API key`,
          sensitive: true,
          envHint: config.envKeys[0]
        });
      }
      break;
  }
  
  return {
    providerId,
    providerName: config.name,
    type: config.type,
    fields
  };
}

/**
 * Validate and save credentials for a provider
 */
export function saveProviderSetup(providerId, credentials) {
  const config = PROVIDER_AUTH_CONFIG[providerId];
  if (!config) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  
  // Validate required fields are present
  const required = getProviderRequiredFields(providerId);
  for (const field of required.fields) {
    if (!field.default && !credentials[field.key]) {
      throw new Error(`Missing required field: ${field.label}`);
    }
  }
  
  // Apply defaults
  for (const field of required.fields) {
    if (field.default && !credentials[field.key]) {
      credentials[field.key] = field.default;
    }
  }
  
  // Save credentials
  setProviderCredentials(providerId, credentials);
  
  return {
    success: true,
    providerId,
    message: `${config.name} configured successfully`
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PRIORITY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get recommended priority order based on configured providers
 */
export function getRecommendedPriority() {
  const configured = [];
  const unconfigured = [];
  
  for (const providerId of DEFAULT_PROVIDER_PRIORITY) {
    if (isProviderConfigured(providerId)) {
      configured.push(providerId);
    } else {
      unconfigured.push(providerId);
    }
  }
  
  return {
    recommended: configured,
    available: unconfigured,
    all: DEFAULT_PROVIDER_PRIORITY
  };
}

/**
 * Save custom priority order
 */
export function savePriorityOrder(priorityList) {
  const config = loadConfig();
  config.providerPriority = priorityList;
  saveConfig(config);
  return config;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLETE SETUP STATE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get complete setup summary for display
 */
export function getSetupSummary() {
  const state = getSetupState();
  const groups = getProviderGroups();
  const agents = getAllAvailableAgents();
  const priority = getRecommendedPriority();
  
  // Count stats
  const totalProviders = Object.values(groups).reduce((sum, g) => sum + g.providers.length, 0);
  const configuredCount = state.configured.length + state.fromEnv.length;
  
  return {
    stats: {
      totalProviders,
      configuredProviders: configuredCount,
      fromEnvironment: state.fromEnv.length,
      fromConfig: state.configured.length,
      unconfigured: state.unconfigured.length,
      installedPlugins: state.plugins.length,
      availableAgents: agents.length
    },
    groups,
    agents,
    plugins: state.plugins,
    priority: {
      current: state.currentPriority,
      recommended: priority.recommended
    },
    settings: {
      autoSwitch: state.autoSwitch
    }
  };
}

/**
 * Generate setup wizard data for the command
 */
export function generateWizardData() {
  const summary = getSetupSummary();
  
  return {
    // Current state
    summary,
    
    // Providers by group for step-by-step setup
    providerGroups: summary.groups,
    
    // Fields needed for each unconfigured provider
    unconfiguredFields: Object.fromEntries(
      summary.stats.unconfigured > 0
        ? Object.values(summary.groups)
            .flatMap(g => g.providers)
            .filter(p => !p.configured)
            .map(p => [p.id, getProviderRequiredFields(p.id)])
        : []
    ),
    
    // Agent list for priority configuration
    agents: summary.agents,
    
    // Installed addons
    plugins: summary.plugins,
    
    // Priority recommendations
    priority: summary.priority
  };
}

// Default export
export default {
  detectInstalledPlugins,
  getAllAvailableAgents,
  detectEnvironmentCredentials,
  getSetupState,
  getProviderGroups,
  getProviderRequiredFields,
  saveProviderSetup,
  getRecommendedPriority,
  savePriorityOrder,
  getSetupSummary,
  generateWizardData,
  ADDON_PLUGINS
};
