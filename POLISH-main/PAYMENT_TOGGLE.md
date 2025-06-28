# POLISH Payment System Toggle

## Quick Setup

The POLISH application includes a simple "light switch" to turn the payment system on/off for testing purposes.

## Frontend Configuration

**File**: `src/config.ts`

**To disable payments for testing:**
```typescript
export const config = {
  // Payment System Toggle - Set to false to disable payments for testing
  paymentSystemEnabled: false, // ← Change this to false to disable payments
  
  // ... rest of config
};
```

**To enable payments:**
```typescript
export const config = {
  // Payment System Toggle - Set to false to disable payments for testing
  paymentSystemEnabled: true, // ← Change this to true to enable payments
  
  // ... rest of config
};
```

## Backend Configuration

**File**: `server/src/config/index.ts`

**To disable payments for testing:**
Set the environment variable:
```bash
PAYMENT_SYSTEM_ENABLED=false
```

**To enable payments:**
Set the environment variable:
```bash
PAYMENT_SYSTEM_ENABLED=true
```

Or simply don't set the variable (defaults to true).

## What Happens When Payments Are Disabled

When `paymentSystemEnabled` is set to `false`:

### Frontend
- Export modals will show "Export completed (payment system disabled)" message
- Format converter will show "Format conversion completed (payment system disabled)" message
- No payment modals will appear
- All export and conversion features work normally

### Backend
- Export endpoints return success with mock download URLs
- Conversion endpoints return success with mock download URLs
- No payment validation occurs
- All processing and export functionality works normally

## Testing Workflow

1. **Set payments to disabled** in both frontend and backend configs
2. **Test all export and conversion features** - they should work without payment prompts
3. **Verify reports and visualizations** work normally
4. **When ready for production**, set payments back to enabled

## Environment Variables

For Docker deployment, you can set the backend payment toggle via environment variable:

```yaml
# docker-compose.yml
environment:
  - PAYMENT_SYSTEM_ENABLED=false  # Disable payments for testing
```

## Notes

- The payment system toggle only affects export and conversion features
- All other functionality (processing, visualization, QC) works normally regardless of the setting
- Reports can still be viewed in the application even when payments are disabled
- This is intended for testing and development only
- For production deployment, ensure payments are enabled 