"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSubscription = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        // For development, allow requests without token
        if (config_1.config.env === 'development') {
            req.user = {
                id: 'dev-user',
                email: 'dev@example.com',
                name: 'Development User',
                subscription: 'premium'
            };
            return next();
        }
        return res.status(401).json({
            success: false,
            error: 'Access token required'
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            name: decoded.name,
            subscription: decoded.subscription
        };
        next();
    }
    catch (error) {
        // For development, allow invalid tokens
        if (config_1.config.env === 'development') {
            req.user = {
                id: 'dev-user',
                email: 'dev@example.com',
                name: 'Development User',
                subscription: 'premium'
            };
            return next();
        }
        return res.status(403).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};
exports.authenticateToken = authenticateToken;
const requireSubscription = (requiredLevel) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const subscriptionLevels = ['free', 'basic', 'premium', 'enterprise'];
        const userLevel = subscriptionLevels.indexOf(user.subscription);
        const requiredLevelIndex = subscriptionLevels.indexOf(requiredLevel);
        if (userLevel < requiredLevelIndex) {
            return res.status(403).json({
                success: false,
                error: `${requiredLevel} subscription required`
            });
        }
        next();
    };
};
exports.requireSubscription = requireSubscription;
//# sourceMappingURL=auth.js.map