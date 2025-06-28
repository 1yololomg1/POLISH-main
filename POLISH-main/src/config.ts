// POLISH Configuration
// This file acts as a "light switch" for various features

export const config = {
  // Payment System Toggle - Set to false to disable payments for testing
  paymentSystemEnabled: true, // ← Change this to false to disable payments
  
  // Other configuration options
  maxFileSize: 100 * 1024 * 1024, // 100MB
  apiBaseUrl: 'http://localhost:3001/api', // Can be overridden by environment variable
  
  // Feature toggles
  features: {
    export: true,
    conversion: true,
    reports: true,
    multiWell: true,
    advancedQC: true,
    geologicalAnalysis: true
  },
  
  // Development/testing options
  development: {
    bypassAuth: false, // Set to true to bypass authentication
    mockData: false,   // Set to true to use mock data
    debugMode: false   // Set to true for debug logging
  }
};

// Helper function to check if payments are enabled
export const isPaymentEnabled = () => config.paymentSystemEnabled;

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof typeof config.features) => {
  return config.features[feature];
};

// Helper function to get configuration value
export const getConfig = <K extends keyof typeof config>(key: K): typeof config[K] => {
  return config[key];
}; 