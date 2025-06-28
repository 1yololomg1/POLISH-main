// POLISH Configuration
// This file acts as a "light switch" for various features

export const config = {
  // Payment System Toggle - Set to false to disable payments for testing
  paymentSystemEnabled: import.meta.env.VITE_PAYMENT_SYSTEM_ENABLED !== 'false', // Default to true unless explicitly disabled
  
  // Other configuration options
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '104857600'), // 100MB
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  
  // Feature toggles
  features: {
    export: import.meta.env.VITE_FEATURE_EXPORT !== 'false',
    conversion: import.meta.env.VITE_FEATURE_CONVERSION !== 'false',
    reports: import.meta.env.VITE_FEATURE_REPORTS !== 'false',
    multiWell: import.meta.env.VITE_FEATURE_MULTI_WELL !== 'false',
    advancedQC: import.meta.env.VITE_FEATURE_ADVANCED_QC !== 'false',
    geologicalAnalysis: import.meta.env.VITE_FEATURE_GEOLOGICAL_ANALYSIS !== 'false'
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