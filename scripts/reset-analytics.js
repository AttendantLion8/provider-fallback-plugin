#!/usr/bin/env node
/**
 * Provider Fallback Plugin - Reset Analytics
 * Clears all analytics data
 * @version 2.2.0
 */

import { resetAnalytics } from '../lib/analytics.js';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function confirm(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force') || args.includes('-f');
  
  console.log('\n⚠️  This will delete ALL analytics data permanently.\n');
  
  if (!force) {
    const confirmed = await confirm('Are you sure? (y/N): ');
    if (!confirmed) {
      console.log('Cancelled.\n');
      rl.close();
      return;
    }
  }
  
  const success = resetAnalytics();
  
  if (success) {
    console.log('\n✓ Analytics data has been reset.\n');
  } else {
    console.log('\n✗ Failed to reset analytics.\n');
  }
  
  rl.close();
}

main();
