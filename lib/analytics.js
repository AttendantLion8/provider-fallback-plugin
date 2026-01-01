/**
 * Provider Fallback Plugin - Usage Analytics Module
 * Tracks provider usage, success rates, latency, and costs
 * @version 2.2.0
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Analytics data file location
const DATA_DIR = join(__dirname, '..', '.data');
const ANALYTICS_FILE = join(DATA_DIR, 'analytics.json');

/**
 * Default analytics structure
 */
const DEFAULT_ANALYTICS = {
  version: '2.2.0',
  created: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  
  // Global stats
  global: {
    totalRequests: 0,
    totalSuccess: 0,
    totalFailures: 0,
    totalFallbacks: 0,
    totalTokensUsed: 0,
    estimatedCostUSD: 0,
    avgLatencyMs: 0
  },
  
  // Per-provider stats
  providers: {},
  
  // Per-model stats
  models: {},
  
  // Hourly usage (last 24h)
  hourlyUsage: [],
  
  // Daily usage (last 30 days)
  dailyUsage: [],
  
  // Fallback events log (last 100)
  fallbackEvents: [],
  
  // Error log (last 50)
  errors: []
};

/**
 * Ensure data directory exists
 */
function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Load analytics data from file
 * @returns {Object} Analytics data
 */
export function loadAnalytics() {
  ensureDataDir();
  
  if (!existsSync(ANALYTICS_FILE)) {
    saveAnalytics(DEFAULT_ANALYTICS);
    return { ...DEFAULT_ANALYTICS };
  }
  
  try {
    const data = readFileSync(ANALYTICS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading analytics:', error.message);
    return { ...DEFAULT_ANALYTICS };
  }
}

/**
 * Save analytics data to file
 * @param {Object} data - Analytics data to save
 */
export function saveAnalytics(data) {
  ensureDataDir();
  
  data.lastUpdated = new Date().toISOString();
  
  try {
    writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving analytics:', error.message);
  }
}

/**
 * Record a provider request
 * @param {Object} options - Request details
 * @param {string} options.provider - Provider ID
 * @param {string} options.model - Model ID
 * @param {boolean} options.success - Whether request succeeded
 * @param {number} options.latencyMs - Request latency in ms
 * @param {number} options.tokensUsed - Tokens consumed
 * @param {number} options.costUSD - Estimated cost in USD
 * @param {string} [options.error] - Error message if failed
 * @param {boolean} [options.wasFallback] - Whether this was a fallback request
 */
export function recordRequest(options) {
  const {
    provider,
    model,
    success,
    latencyMs = 0,
    tokensUsed = 0,
    costUSD = 0,
    error = null,
    wasFallback = false
  } = options;
  
  const analytics = loadAnalytics();
  const now = new Date();
  const hour = now.toISOString().slice(0, 13) + ':00:00Z';
  const day = now.toISOString().slice(0, 10);
  
  // Update global stats
  analytics.global.totalRequests++;
  if (success) {
    analytics.global.totalSuccess++;
  } else {
    analytics.global.totalFailures++;
  }
  if (wasFallback) {
    analytics.global.totalFallbacks++;
  }
  analytics.global.totalTokensUsed += tokensUsed;
  analytics.global.estimatedCostUSD += costUSD;
  
  // Update average latency (rolling average)
  const totalRequests = analytics.global.totalRequests;
  analytics.global.avgLatencyMs = 
    ((analytics.global.avgLatencyMs * (totalRequests - 1)) + latencyMs) / totalRequests;
  
  // Update provider stats
  if (!analytics.providers[provider]) {
    analytics.providers[provider] = {
      requests: 0,
      success: 0,
      failures: 0,
      fallbacksTo: 0,
      fallbacksFrom: 0,
      tokensUsed: 0,
      costUSD: 0,
      avgLatencyMs: 0,
      lastUsed: null,
      lastError: null
    };
  }
  
  const providerStats = analytics.providers[provider];
  providerStats.requests++;
  if (success) {
    providerStats.success++;
  } else {
    providerStats.failures++;
    providerStats.lastError = error;
  }
  if (wasFallback) {
    providerStats.fallbacksTo++;
  }
  providerStats.tokensUsed += tokensUsed;
  providerStats.costUSD += costUSD;
  providerStats.avgLatencyMs = 
    ((providerStats.avgLatencyMs * (providerStats.requests - 1)) + latencyMs) / providerStats.requests;
  providerStats.lastUsed = now.toISOString();
  
  // Update model stats
  if (!analytics.models[model]) {
    analytics.models[model] = {
      requests: 0,
      success: 0,
      failures: 0,
      tokensUsed: 0,
      costUSD: 0,
      avgLatencyMs: 0,
      lastUsed: null,
      providersUsed: []
    };
  }
  
  const modelStats = analytics.models[model];
  modelStats.requests++;
  if (success) {
    modelStats.success++;
  } else {
    modelStats.failures++;
  }
  modelStats.tokensUsed += tokensUsed;
  modelStats.costUSD += costUSD;
  modelStats.avgLatencyMs = 
    ((modelStats.avgLatencyMs * (modelStats.requests - 1)) + latencyMs) / modelStats.requests;
  modelStats.lastUsed = now.toISOString();
  if (!modelStats.providersUsed.includes(provider)) {
    modelStats.providersUsed.push(provider);
  }
  
  // Update hourly usage (keep last 24 entries)
  let hourEntry = analytics.hourlyUsage.find(h => h.hour === hour);
  if (!hourEntry) {
    hourEntry = { hour, requests: 0, success: 0, failures: 0, tokensUsed: 0, costUSD: 0 };
    analytics.hourlyUsage.push(hourEntry);
  }
  hourEntry.requests++;
  if (success) hourEntry.success++;
  else hourEntry.failures++;
  hourEntry.tokensUsed += tokensUsed;
  hourEntry.costUSD += costUSD;
  
  // Keep only last 24 hours
  analytics.hourlyUsage = analytics.hourlyUsage
    .sort((a, b) => b.hour.localeCompare(a.hour))
    .slice(0, 24);
  
  // Update daily usage (keep last 30 entries)
  let dayEntry = analytics.dailyUsage.find(d => d.day === day);
  if (!dayEntry) {
    dayEntry = { day, requests: 0, success: 0, failures: 0, tokensUsed: 0, costUSD: 0 };
    analytics.dailyUsage.push(dayEntry);
  }
  dayEntry.requests++;
  if (success) dayEntry.success++;
  else dayEntry.failures++;
  dayEntry.tokensUsed += tokensUsed;
  dayEntry.costUSD += costUSD;
  
  // Keep only last 30 days
  analytics.dailyUsage = analytics.dailyUsage
    .sort((a, b) => b.day.localeCompare(a.day))
    .slice(0, 30);
  
  // Log error if failed
  if (!success && error) {
    analytics.errors.unshift({
      timestamp: now.toISOString(),
      provider,
      model,
      error
    });
    analytics.errors = analytics.errors.slice(0, 50);
  }
  
  saveAnalytics(analytics);
}

/**
 * Record a fallback event
 * @param {Object} options - Fallback details
 * @param {string} options.fromProvider - Original provider
 * @param {string} options.toProvider - Fallback provider
 * @param {string} options.model - Model being used
 * @param {string} options.reason - Reason for fallback
 */
export function recordFallback(options) {
  const { fromProvider, toProvider, model, reason } = options;
  
  const analytics = loadAnalytics();
  
  // Update provider fallback counts
  if (analytics.providers[fromProvider]) {
    analytics.providers[fromProvider].fallbacksFrom++;
  }
  
  // Log fallback event
  analytics.fallbackEvents.unshift({
    timestamp: new Date().toISOString(),
    fromProvider,
    toProvider,
    model,
    reason
  });
  analytics.fallbackEvents = analytics.fallbackEvents.slice(0, 100);
  
  saveAnalytics(analytics);
}

/**
 * Get analytics summary
 * @param {string} [period='24h'] - Time period: '1h', '24h', '7d', '30d', 'all'
 * @returns {Object} Analytics summary
 */
export function getSummary(period = '24h') {
  const analytics = loadAnalytics();
  const now = new Date();
  
  let filteredRequests = { ...analytics.global };
  
  if (period === '24h') {
    const last24h = analytics.hourlyUsage.reduce((acc, h) => ({
      requests: acc.requests + h.requests,
      success: acc.success + h.success,
      failures: acc.failures + h.failures,
      tokensUsed: acc.tokensUsed + h.tokensUsed,
      costUSD: acc.costUSD + h.costUSD
    }), { requests: 0, success: 0, failures: 0, tokensUsed: 0, costUSD: 0 });
    
    filteredRequests = {
      ...filteredRequests,
      ...last24h,
      period: 'Last 24 Hours'
    };
  } else if (period === '7d') {
    const last7d = analytics.dailyUsage.slice(0, 7).reduce((acc, d) => ({
      requests: acc.requests + d.requests,
      success: acc.success + d.success,
      failures: acc.failures + d.failures,
      tokensUsed: acc.tokensUsed + d.tokensUsed,
      costUSD: acc.costUSD + d.costUSD
    }), { requests: 0, success: 0, failures: 0, tokensUsed: 0, costUSD: 0 });
    
    filteredRequests = {
      ...filteredRequests,
      ...last7d,
      period: 'Last 7 Days'
    };
  } else if (period === '30d') {
    const last30d = analytics.dailyUsage.reduce((acc, d) => ({
      requests: acc.requests + d.requests,
      success: acc.success + d.success,
      failures: acc.failures + d.failures,
      tokensUsed: acc.tokensUsed + d.tokensUsed,
      costUSD: acc.costUSD + d.costUSD
    }), { requests: 0, success: 0, failures: 0, tokensUsed: 0, costUSD: 0 });
    
    filteredRequests = {
      ...filteredRequests,
      ...last30d,
      period: 'Last 30 Days'
    };
  } else {
    filteredRequests.period = 'All Time';
  }
  
  // Calculate success rate
  filteredRequests.successRate = filteredRequests.requests > 0
    ? ((filteredRequests.success / filteredRequests.requests) * 100).toFixed(2) + '%'
    : 'N/A';
  
  return {
    summary: filteredRequests,
    topProviders: Object.entries(analytics.providers)
      .sort((a, b) => b[1].requests - a[1].requests)
      .slice(0, 5)
      .map(([id, stats]) => ({
        id,
        requests: stats.requests,
        successRate: stats.requests > 0 
          ? ((stats.success / stats.requests) * 100).toFixed(1) + '%' 
          : 'N/A',
        avgLatency: Math.round(stats.avgLatencyMs) + 'ms'
      })),
    topModels: Object.entries(analytics.models)
      .sort((a, b) => b[1].requests - a[1].requests)
      .slice(0, 5)
      .map(([id, stats]) => ({
        id,
        requests: stats.requests,
        successRate: stats.requests > 0 
          ? ((stats.success / stats.requests) * 100).toFixed(1) + '%' 
          : 'N/A'
      })),
    recentFallbacks: analytics.fallbackEvents.slice(0, 5),
    recentErrors: analytics.errors.slice(0, 5)
  };
}

/**
 * Get provider performance comparison
 * @returns {Object[]} Provider comparison data
 */
export function getProviderComparison() {
  const analytics = loadAnalytics();
  
  return Object.entries(analytics.providers)
    .map(([id, stats]) => ({
      provider: id,
      requests: stats.requests,
      successRate: stats.requests > 0 
        ? ((stats.success / stats.requests) * 100).toFixed(2) 
        : 0,
      failureRate: stats.requests > 0 
        ? ((stats.failures / stats.requests) * 100).toFixed(2) 
        : 0,
      avgLatencyMs: Math.round(stats.avgLatencyMs),
      tokensUsed: stats.tokensUsed,
      costUSD: stats.costUSD.toFixed(4),
      fallbacksTo: stats.fallbacksTo,
      fallbacksFrom: stats.fallbacksFrom,
      lastUsed: stats.lastUsed,
      lastError: stats.lastError
    }))
    .sort((a, b) => parseFloat(b.successRate) - parseFloat(a.successRate));
}

/**
 * Get cost analysis
 * @param {string} [groupBy='provider'] - Group by: 'provider', 'model', 'day'
 * @returns {Object[]} Cost breakdown
 */
export function getCostAnalysis(groupBy = 'provider') {
  const analytics = loadAnalytics();
  
  if (groupBy === 'provider') {
    return Object.entries(analytics.providers)
      .map(([id, stats]) => ({
        name: id,
        tokensUsed: stats.tokensUsed,
        costUSD: stats.costUSD.toFixed(4),
        requests: stats.requests,
        costPerRequest: stats.requests > 0 
          ? (stats.costUSD / stats.requests).toFixed(6) 
          : '0'
      }))
      .sort((a, b) => parseFloat(b.costUSD) - parseFloat(a.costUSD));
  } else if (groupBy === 'model') {
    return Object.entries(analytics.models)
      .map(([id, stats]) => ({
        name: id,
        tokensUsed: stats.tokensUsed,
        costUSD: stats.costUSD.toFixed(4),
        requests: stats.requests,
        costPerRequest: stats.requests > 0 
          ? (stats.costUSD / stats.requests).toFixed(6) 
          : '0'
      }))
      .sort((a, b) => parseFloat(b.costUSD) - parseFloat(a.costUSD));
  } else if (groupBy === 'day') {
    return analytics.dailyUsage.map(d => ({
      name: d.day,
      tokensUsed: d.tokensUsed,
      costUSD: d.costUSD.toFixed(4),
      requests: d.requests,
      costPerRequest: d.requests > 0 
        ? (d.costUSD / d.requests).toFixed(6) 
        : '0'
    }));
  }
  
  return [];
}

/**
 * Reset all analytics data
 * @returns {boolean} Success status
 */
export function resetAnalytics() {
  try {
    saveAnalytics({ ...DEFAULT_ANALYTICS, created: new Date().toISOString() });
    return true;
  } catch (error) {
    console.error('Error resetting analytics:', error.message);
    return false;
  }
}

/**
 * Export analytics to JSON
 * @returns {string} JSON string of all analytics
 */
export function exportAnalytics() {
  const analytics = loadAnalytics();
  return JSON.stringify(analytics, null, 2);
}

// Default export for convenience
export default {
  loadAnalytics,
  saveAnalytics,
  recordRequest,
  recordFallback,
  getSummary,
  getProviderComparison,
  getCostAnalysis,
  resetAnalytics,
  exportAnalytics
};
