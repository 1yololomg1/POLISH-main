-- POLISH Database Initialization Script
-- This script sets up the initial database structure and sample data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database if it doesn't exist (this should be done outside this script)
-- CREATE DATABASE polish;

-- Connect to the polish database
-- \c polish;

-- Create initial configuration table
CREATE TABLE IF NOT EXISTS configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configurations
INSERT INTO configurations (key, value, description) VALUES
('app_version', '1.1.0', 'Current application version'),
('max_file_size', '104857600', 'Maximum file size in bytes (100MB)'),
('processing_timeout', '300000', 'Processing timeout in milliseconds (5 minutes)'),
('rate_limit_window', '900000', 'Rate limit window in milliseconds (15 minutes)'),
('rate_limit_max', '100', 'Maximum requests per rate limit window'),
('default_quality_threshold', '75', 'Default quality score threshold'),
('stripe_enabled', 'true', 'Whether Stripe payments are enabled'),
('maintenance_mode', 'false', 'Whether the application is in maintenance mode')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- Create system logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(10) NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for system logs
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- Insert initial system log
INSERT INTO system_logs (level, message, metadata) VALUES
('info', 'Database initialized successfully', '{"version": "1.1.0", "timestamp": "' || CURRENT_TIMESTAMP || '"}');

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO polish_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO polish_user;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_configurations_key ON configurations(key);
CREATE INDEX IF NOT EXISTS idx_system_logs_level_created ON system_logs(level, created_at);

-- Log successful initialization
INSERT INTO system_logs (level, message, metadata) VALUES
('info', 'Database initialization script completed', '{"script": "init.sql", "timestamp": "' || CURRENT_TIMESTAMP || '"}'); 