# POLISH Deployment Security Checklist

## Pre-Deployment Security Checks

- [ ] Remove any hardcoded API keys, secrets, or credentials
- [ ] Ensure all environment variables are configured in Netlify dashboard
- [ ] Verify Content Security Policy headers are properly configured
- [ ] Check that all API endpoints use HTTPS
- [ ] Confirm client-side validation is backed by server-side validation
- [ ] Verify that error messages don't leak sensitive information
- [ ] Ensure proper CORS configuration on backend API

## Netlify-Specific Security Configuration

- [ ] Enable branch deploy protection if using branch deploys
- [ ] Configure deploy contexts appropriately (production, preview, branch)
- [ ] Set up proper build environment variables in Netlify dashboard
- [ ] Enable Netlify's asset optimization
- [ ] Configure custom domain with HTTPS
- [ ] Set up proper redirect rules
- [ ] Enable HTTP/2 and TLS 1.3

## Backend Security Considerations

- [ ] Ensure backend API has rate limiting enabled
- [ ] Verify JWT token validation and expiration
- [ ] Confirm database connection strings are secure and not exposed
- [ ] Check that all API endpoints require proper authentication
- [ ] Verify Stripe webhook signatures are validated
- [ ] Ensure proper error handling and logging (without sensitive data)
- [ ] Confirm database has proper access controls

## Post-Deployment Verification

- [ ] Run security headers check (https://securityheaders.com)
- [ ] Verify SSL configuration (https://www.ssllabs.com/ssltest/)
- [ ] Test payment flow in test mode
- [ ] Verify file upload size limits are enforced
- [ ] Check that all API endpoints return proper CORS headers
- [ ] Verify that sensitive operations require authentication
- [ ] Test application with security tools (OWASP ZAP, etc.)

## Regular Maintenance

- [ ] Set up regular dependency updates
- [ ] Plan for security patch deployment
- [ ] Implement monitoring for suspicious activities
- [ ] Create a security incident response plan
- [ ] Schedule regular security reviews