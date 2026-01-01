#!/usr/bin/env node
/**
 * Provider Fallback Plugin - Show Analytics
 * Displays usage analytics in a formatted table
 * @version 2.2.0
 */

import { getSummary, getProviderComparison, getCostAnalysis } from '../lib/analytics.js';

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m'
};

function formatNumber(num) {
  if (typeof num === 'number') {
    return num.toLocaleString();
  }
  return num;
}

function formatTable(headers, rows, title = '') {
  if (title) {
    console.log(`\n${colors.cyan}${colors.bold}${title}${colors.reset}`);
    console.log('─'.repeat(60));
  }
  
  // Calculate column widths
  const widths = headers.map((h, i) => {
    const colValues = [h, ...rows.map(r => String(r[i] || ''))];
    return Math.max(...colValues.map(v => v.length)) + 2;
  });
  
  // Print header
  const headerLine = headers.map((h, i) => h.padEnd(widths[i])).join('│');
  console.log(colors.bold + headerLine + colors.reset);
  console.log(widths.map(w => '─'.repeat(w)).join('┼'));
  
  // Print rows
  for (const row of rows) {
    const line = row.map((cell, i) => String(cell || '').padEnd(widths[i])).join('│');
    console.log(line);
  }
}

function main() {
  const args = process.argv.slice(2);
  const period = args[0] || '24h';
  const showCosts = args.includes('--costs');
  const showComparison = args.includes('--compare');
  
  console.log('\n' + '═'.repeat(60));
  console.log(`${colors.cyan}${colors.bold}  Provider Fallback - Usage Analytics${colors.reset}`);
  console.log('═'.repeat(60));
  
  try {
    // Get summary
    const summary = getSummary(period);
    
    // Overview
    formatTable(
      ['Metric', 'Value'],
      [
        ['Period', summary.summary.period],
        ['Total Requests', formatNumber(summary.summary.totalRequests || summary.summary.requests)],
        ['Success', formatNumber(summary.summary.totalSuccess || summary.summary.success)],
        ['Failures', formatNumber(summary.summary.totalFailures || summary.summary.failures)],
        ['Success Rate', summary.summary.successRate],
        ['Tokens Used', formatNumber(summary.summary.totalTokensUsed || summary.summary.tokensUsed)],
        ['Est. Cost (USD)', '$' + (summary.summary.estimatedCostUSD || summary.summary.costUSD || 0).toFixed(4)],
        ['Avg Latency', Math.round(summary.summary.avgLatencyMs || 0) + 'ms'],
        ['Total Fallbacks', formatNumber(summary.summary.totalFallbacks || 0)]
      ],
      '📊 Overview'
    );
    
    // Top Providers
    if (summary.topProviders.length > 0) {
      formatTable(
        ['Provider', 'Requests', 'Success Rate', 'Avg Latency'],
        summary.topProviders.map(p => [p.id, formatNumber(p.requests), p.successRate, p.avgLatency]),
        '🏆 Top Providers'
      );
    }
    
    // Top Models
    if (summary.topModels.length > 0) {
      formatTable(
        ['Model', 'Requests', 'Success Rate'],
        summary.topModels.map(m => [m.id, formatNumber(m.requests), m.successRate]),
        '🤖 Top Models'
      );
    }
    
    // Recent Fallbacks
    if (summary.recentFallbacks.length > 0) {
      formatTable(
        ['Time', 'From', 'To', 'Reason'],
        summary.recentFallbacks.map(f => [
          new Date(f.timestamp).toLocaleTimeString(),
          f.fromProvider,
          f.toProvider,
          f.reason.slice(0, 20) + (f.reason.length > 20 ? '...' : '')
        ]),
        '🔄 Recent Fallbacks'
      );
    }
    
    // Recent Errors
    if (summary.recentErrors.length > 0) {
      formatTable(
        ['Time', 'Provider', 'Error'],
        summary.recentErrors.map(e => [
          new Date(e.timestamp).toLocaleTimeString(),
          e.provider,
          e.error.slice(0, 30) + (e.error.length > 30 ? '...' : '')
        ]),
        '❌ Recent Errors'
      );
    }
    
    // Provider Comparison (optional)
    if (showComparison) {
      const comparison = getProviderComparison();
      if (comparison.length > 0) {
        formatTable(
          ['Provider', 'Requests', 'Success%', 'Latency', 'Cost'],
          comparison.slice(0, 10).map(p => [
            p.provider,
            formatNumber(p.requests),
            p.successRate + '%',
            p.avgLatencyMs + 'ms',
            '$' + p.costUSD
          ]),
          '📈 Provider Comparison'
        );
      }
    }
    
    // Cost Analysis (optional)
    if (showCosts) {
      const costs = getCostAnalysis('provider');
      if (costs.length > 0) {
        formatTable(
          ['Provider', 'Tokens', 'Cost', 'Cost/Request'],
          costs.slice(0, 10).map(c => [
            c.name,
            formatNumber(c.tokensUsed),
            '$' + c.costUSD,
            '$' + c.costPerRequest
          ]),
          '💰 Cost Analysis'
        );
      }
    }
    
    console.log('\n' + colors.dim + 'Usage: node show-analytics.js [period] [--costs] [--compare]');
    console.log('Periods: 1h, 24h, 7d, 30d, all' + colors.reset + '\n');
    
  } catch (error) {
    console.error(`${colors.red}Error loading analytics: ${error.message}${colors.reset}`);
    console.log(`${colors.dim}Analytics may not have any data yet.${colors.reset}\n`);
  }
}

main();
