/**
 * Provider Fallback Plugin - Main Library Export
 * @version 2.5.0
 */

export * from './providers.js';
export * from './models.js';
export * from './auth.js';
export * from './analytics.js';
export * from './setup-wizard.js';

// Re-export defaults for convenience
import providers from './providers.js';
import models from './models.js';
import auth from './auth.js';
import analytics from './analytics.js';
import setupWizard from './setup-wizard.js';

export default {
  providers,
  models,
  auth,
  analytics,
  setupWizard
};
