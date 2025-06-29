"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const http_1 = require("http");
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const auth_1 = require("./routes/auth");
const files_1 = require("./routes/files");
const processing_1 = require("./routes/processing");
const export_1 = require("./routes/export");
const conversion_1 = require("./routes/conversion");
const payment_1 = require("./routes/payment");
const admin_1 = require("./routes/admin");
const database_1 = require("./database");
const redis_1 = require("./cache/redis");
const queues_1 = require("./queues");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.stripe.com"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false
}));
app.use((0, compression_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.cors.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express_1.default.json({ limit: '100mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '100mb' }));
// Rate limiting
app.use(rateLimiter_1.rateLimiter);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});
// API routes
app.use('/api/auth', auth_1.authRoutes);
app.use('/api/files', files_1.fileRoutes);
app.use('/api/processing', processing_1.processingRoutes);
app.use('/api/export', export_1.exportRoutes);
app.use('/api/conversion', conversion_1.conversionRoutes);
app.use('/api/payment', payment_1.paymentRoutes);
app.use('/api/admin', admin_1.adminRoutes);
// Error handling
app.use(errorHandler_1.errorHandler);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
async function startServer() {
    try {
        // Initialize database
        await (0, database_1.initializeDatabase)();
        logger_1.logger.info('Database initialized');
        // Initialize Redis
        await (0, redis_1.initializeRedis)();
        logger_1.logger.info('Redis initialized');
        // Initialize job queues
        await (0, queues_1.initializeQueues)();
        logger_1.logger.info('Job queues initialized');
        // Start server
        server.listen(config_1.config.port, () => {
            logger_1.logger.info(`POLISH Backend Server running on port ${config_1.config.port}`);
            logger_1.logger.info(`Environment: ${config_1.config.env}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger_1.logger.info('Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger_1.logger.info('Process terminated');
        process.exit(0);
    });
});
startServer();
//# sourceMappingURL=server.js.map