export declare const config: {
    env: string;
    port: number;
    database: {
        url: string;
        maxConnections: number;
        ssl: boolean;
    };
    redis: {
        url: string;
        password: string | undefined;
        maxRetries: number;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    stripe: {
        secretKey: string;
        webhookSecret: string;
        publishableKey: string;
    };
    storage: {
        provider: string;
        maxFileSize: number;
        allowedTypes: string[];
        uploadPath: string;
        s3: {
            bucket: string;
            region: string;
            accessKeyId: string;
            secretAccessKey: string;
        };
    };
    cors: {
        allowedOrigins: string[];
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
        skipSuccessfulRequests: boolean;
    };
    processing: {
        maxConcurrentJobs: number;
        jobTimeout: number;
        retryAttempts: number;
    };
    email: {
        provider: string;
        smtp: {
            host: string;
            port: number;
            secure: boolean;
            user: string;
            password: string;
        };
    };
    security: {
        bcryptRounds: number;
        sessionSecret: string;
        encryptionKey: string;
    };
};
//# sourceMappingURL=index.d.ts.map