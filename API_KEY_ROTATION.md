# Multi-API Key Rotation System

## Overview

This system automatically manages multiple Google Gemini API keys and rotates through them when one becomes rate-limited or overloaded. This ensures high availability and prevents service interruptions.

## How It Works

1. **Round-Robin Rotation**: Keys are used in rotation to distribute load evenly
2. **Automatic Failover**: If a key fails, the system automatically tries the next available key
3. **Smart Cooldown**: Failed keys are temporarily disabled and automatically re-enabled after a cooldown period
4. **Retry Logic**: Automatically retries failed requests up to 3 times with different keys

## Setup

### 1. Get Multiple API Keys

Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and create multiple API keys.

### 2. Add Keys to Environment Variables

Edit your `.env.local` file:

```env
# Primary API key (required)
GOOGLE_API_KEY=AIzaSyC...your_first_key

# Additional API keys (optional, add as many as you need)
GOOGLE_API_KEY_2=AIzaSyD...your_second_key
GOOGLE_API_KEY_3=AIzaSyE...your_third_key
GOOGLE_API_KEY_4=AIzaSyF...your_fourth_key
```

### 3. Restart Your Application

```bash
npm run dev
```

## Features

### Automatic Key Rotation
- Keys are used in round-robin fashion
- Distributes load evenly across all keys
- Prevents any single key from being overused

### Failure Detection
- Detects rate limit errors (429)
- Detects overload errors (503)
- Detects quota exceeded errors
- Automatically marks failed keys as unavailable

### Cooldown Period
- Failed keys are disabled for 1 minute
- Automatically re-enabled after cooldown
- Prevents hammering failed keys

### Retry Logic
- Automatically retries failed requests
- Uses different keys for each retry
- Exponential backoff between retries

## Monitoring

### Check API Key Status

Admin users can check the status of all API keys:

```bash
GET /api/admin/api-keys/status
```

Response:
```json
{
  "success": true,
  "totalKeys": 4,
  "availableKeys": 3,
  "unavailableKeys": 1,
  "keys": [
    {
      "key": "AIza...pPU",
      "isAvailable": true,
      "failureCount": 0,
      "lastUsed": "2024-01-15T10:30:00Z",
      "lastError": null
    },
    {
      "key": "AIzb...qQV",
      "isAvailable": false,
      "failureCount": 3,
      "lastUsed": "2024-01-15T10:29:45Z",
      "lastError": "503: Service temporarily overloaded"
    }
  ]
}
```

### Console Logs

The system logs key usage and failures:

```
Initialized API Key Manager with 4 key(s)
Using API key #1 (AIza...pPU)
API call failed with key AIza...pPU: 503 Service overloaded
Attempting retry 1/3 with next key...
Using API key #2 (AIzb...qQV)
API key AIza...pPU marked as unavailable after 3 failures. Will retry after cooldown period.
API key AIza...pPU is back online after cooldown
```

## Best Practices

### 1. Use Multiple Keys
- Recommended: 3-5 API keys
- More keys = better availability
- Each key has its own rate limit

### 2. Monitor Usage
- Check API key status regularly
- Watch for patterns of failures
- Adjust number of keys based on usage

### 3. Set Appropriate Quotas
- Ensure each key has sufficient quota
- Monitor quota usage in Google AI Studio
- Upgrade quotas if needed

### 4. Handle Errors Gracefully
- The system automatically handles most errors
- Display user-friendly messages
- Log errors for debugging

## Error Messages

### All Keys Unavailable
```
"All 4 API key(s) are currently rate-limited. Please wait a few minutes and try again."
```
**Solution**: Wait for cooldown period or add more API keys

### Service Overloaded
```
"Google AI service is temporarily overloaded. Tried 4 API key(s). Please wait a moment and try again."
```
**Solution**: System will automatically retry with different keys

### Quota Exceeded
```
"API quota exceeded on all 4 key(s). Please try again later."
```
**Solution**: Wait for quota reset or upgrade your API keys

## Configuration

### Adjust Cooldown Period

Edit `src/lib/api-key-manager.ts`:

```typescript
private cooldownPeriod: number = 60000; // 1 minute (change as needed)
```

### Adjust Max Failures

```typescript
private maxFailures: number = 3; // Number of failures before cooldown
```

### Adjust Max Retries

In `src/lib/actions.ts`:

```typescript
const result = await executeWithKeyRotation(async (apiKey) => {
  // ...
}, 3); // Change retry count here
```

## Troubleshooting

### Keys Not Rotating
- Check that multiple keys are in `.env.local`
- Restart the application
- Check console logs for initialization

### All Keys Failing
- Verify all keys are valid in Google AI Studio
- Check quota limits for each key
- Wait for cooldown period to expire

### Slow Performance
- Reduce retry count
- Increase cooldown period
- Add more API keys

## Architecture

```
┌─────────────────────────────────────────┐
│         User Request                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    executeWithKeyRotation()              │
│    - Manages retry logic                 │
│    - Handles errors                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    ApiKeyManager                         │
│    - getNextKey() → Round-robin          │
│    - markKeyAsFailed() → Cooldown        │
│    - markKeyAsSuccess() → Reset          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    Google Gemini API                     │
│    - Key 1, Key 2, Key 3, Key 4...       │
└─────────────────────────────────────────┘
```

## Benefits

✅ **High Availability**: Service continues even if some keys fail  
✅ **Load Distribution**: Requests spread across multiple keys  
✅ **Automatic Recovery**: Failed keys automatically re-enabled  
✅ **No Manual Intervention**: System handles failures automatically  
✅ **Better User Experience**: Fewer "service unavailable" errors  
✅ **Scalable**: Add more keys as needed  

## Support

For issues or questions:
- Check console logs for detailed error messages
- Monitor API key status via admin endpoint
- Review Google AI Studio for quota information
