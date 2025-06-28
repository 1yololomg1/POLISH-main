import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Payment System Toggle - Set to false to disable payments for testing
  paymentSystemEnabled: process.env.PAYMENT_SYSTEM_ENABLED !== 'false', // Default to true unless explicitly disabled
  
  // Server Configuration
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001'),
  
  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://polish_user:polish_password@localhost:5432/polish',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
    ssl: process.env.NODE_ENV === 'production'
  },
  
  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    maxMemory: process.env.REDIS_MAX_MEMORY || '1gb',
    maxRetries: 3
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'
  },
  
  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
  },
  
  // File storage
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local', // 'local' | 's3' | 'gcs'
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'), // 100MB
    allowedTypes: ['application/octet-stream', 'text/plain'],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    
    // AWS S3
    s3: {
      bucket: process.env.S3_BUCKET || '',
      region: process.env.S3_REGION || 'us-east-1',
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ''
    }
  },
  
  // CORS
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173']
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    skipSuccessfulRequests: true
  },
  
  // Processing
  processing: {
    maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS || '5'),
    jobTimeout: parseInt(process.env.JOB_TIMEOUT || '300000'), // 5 minutes
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3')
  },
  
  // Email (for notifications)
  email: {
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || ''
    }
  },
  
  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
  encryptionKey: process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key-here',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  enableHSTS: process.env.ENABLE_HSTS === 'true',
  enableCSP: process.env.ENABLE_CSP === 'true',
  
  // Feature Toggles
  features: {
    export: process.env.FEATURE_EXPORT !== 'false',
    conversion: process.env.FEATURE_CONVERSION !== 'false',
    reports: process.env.FEATURE_REPORTS !== 'false',
    multiWell: process.env.FEATURE_MULTI_WELL !== 'false',
    advancedQC: process.env.FEATURE_ADVANCED_QC !== 'false',
    geologicalAnalysis: process.env.FEATURE_GEOLOGICAL_ANALYSIS !== 'false',
  },
  
  // Development Configuration
  development: {
    bypassAuth: process.env.BYPASS_AUTH === 'true',
    mockData: process.env.MOCK_DATA === 'true',
    debugMode: process.env.DEBUG_MODE === 'true',
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