# POLISH Deployment Guide

This document provides instructions for deploying the POLISH application to production.

## Prerequisites

- Netlify account
- Node.js 18+
- npm 9+
- Git

## Deployment Options

### Option 1: Netlify UI Deployment

1. **Connect to Git Repository**
   - Log in to Netlify
   - Click "New site from Git"
   - Connect to your Git provider
   - Select the POLISH repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy site"

3. **Set Environment Variables**
   - Go to Site settings > Build & deploy > Environment
   - Add the following environment variables:
     - `VITE_API_BASE_URL`: URL of your backend API
     - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
     - `VITE_PAYMENT_SYSTEM_ENABLED`: Set to `true` to enable payments

4. **Configure Custom Domain**
   - Go to Site settings > Domain management
   - Add custom domain: `polish.traceseis.com`
   - Follow the DNS configuration instructions

### Option 2: Netlify CLI Deployment

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Netlify Configuration**
   ```bash
   netlify init
   ```

4. **Build and Deploy**
   ```bash
   npm run build
   netlify deploy --prod
   ```

## Backend Deployment Options

The POLISH application requires a backend server for API functionality. You have several options:

### Option 1: Netlify Functions (Serverless)

1. Create a `netlify/functions` directory
2. Convert Express routes to Netlify Functions
3. Update API base URL to point to `/.netlify/functions/`

### Option 2: Separate Backend Hosting

1. Deploy the server directory to a hosting provider:
   - Heroku
   - DigitalOcean
   - AWS EC2
   - Google Cloud Run

2. Set up environment variables on the backend:
   - Database connection strings
   - Stripe secret key
   - JWT secret

3. Update the frontend's `VITE_API_BASE_URL` to point to your hosted backend

## Database Setup

The POLISH application requires PostgreSQL and Redis:

1. **PostgreSQL Options**:
   - Managed service: AWS RDS, DigitalOcean Managed Databases, etc.
   - Self-hosted: Install on your own server

2. **Redis Options**:
   - Managed service: AWS ElastiCache, Redis Labs, etc.
   - Self-hosted: Install on your own server

3. **Configure Connection Strings**:
   - Update backend environment variables with connection strings

## SSL Configuration

Ensure your application uses HTTPS:

1. Netlify automatically provisions SSL certificates for custom domains
2. For the backend, configure SSL based on your hosting provider

## Monitoring and Maintenance

1. **Set Up Monitoring**:
   - Netlify Analytics
   - Google Analytics
   - Server monitoring tools

2. **Regular Maintenance**:
   - Keep dependencies updated
   - Monitor error logs
   - Perform regular backups

## Troubleshooting

If you encounter issues during deployment:

1. Check Netlify deploy logs
2. Verify environment variables are set correctly
3. Ensure API endpoints are accessible
4. Check browser console for frontend errors
5. Verify database connections

For additional help, contact support@traceseis.com