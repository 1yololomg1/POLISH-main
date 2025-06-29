"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const config_1 = require("../config");
// Simple in-memory rate limiting (in production, use Redis)
const requestCounts = new Map();
const rateLimiter = (req, res, next) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const windowMs = config_1.config.rateLimit.windowMs;
    const maxRequests = config_1.config.rateLimit.maxRequests;
    // Get or create client record
    let clientRecord = requestCounts.get(clientId);
    if (!clientRecord || now > clientRecord.resetTime) {
        clientRecord = {
            count: 0,
            resetTime: now + windowMs
        };
    }
    // Check if limit exceeded
    if (clientRecord.count >= maxRequests) {
        return res.status(429).json({
            success: false,
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((clientRecord.resetTime - now) / 1000)
        });
    }
    // Increment count
    clientRecord.count++;
    requestCounts.set(clientId, clientRecord);
    // Add headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - clientRecord.count);
    res.setHeader('X-RateLimit-Reset', new Date(clientRecord.resetTime).toISOString());
    next();
};
exports.rateLimiter = rateLimiter;
//# sourceMappingURL=rateLimiter.js.map