# Google AI Error Fix - 503 Service Unavailable

## Problem
"Generation Failed - 503 Service Unavailable" when creating quizzes.

## What I Fixed

### 1. Changed AI Model ✅
**From:** `gemini-2.5-flash` (unstable/not available)
**To:** `gemini-1.5-flash` (stable and reliable)

### 2. Added Better Error Messages ✅
Now shows specific errors:
- "Service is overloaded" - Try again in a moment
- "API quota exceeded" - Check your API key limits
- "Invalid API key" - Check your configuration

## Solutions (Try in Order)

### Solution 1: Wait and Retry (Most Common)
Google's AI service is temporarily overloaded.

**What to do:**
1. Wait 30-60 seconds
2. Try creating the quiz again
3. Should work now ✅

### Solution 2: Check Your API Key

Your API key might have issues.

**Steps:**
1. Go to: https://makersuite.google.com/app/apikey
2. Check if your API key is valid
3. Check if you have quota remaining
4. If needed, create a new API key
5. Update `.env.local`:
   ```env
   GOOGLE_API_KEY=your_new_api_key
   ```
6. Restart dev server: `npm run dev`

### Solution 3: Use a Different Model

If `gemini-1.5-flash` doesn't work, try `gemini-1.5-pro`:

**Edit:** `src/ai/genkit.ts`
```typescript
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-pro',  // Change this line
});
```

Then restart: `npm run dev`

### Solution 4: Check API Quota

1. Go to: https://console.cloud.google.com/apis/dashboard
2. Select your project
3. Check "Generative Language API" quota
4. If exceeded, wait for reset or upgrade

## Quick Test

After fixing, test quiz generation:

1. Go to: http://localhost:9002/dashboard
2. Click "Create Quiz" tab
3. Enter:
   - Topic: "JavaScript"
   - Difficulty: "Easy"
   - Questions: 5
4. Click "Generate Quiz"
5. Should work now! ✅

## Error Messages Explained

### "503 Service Unavailable"
**Meaning:** Google's servers are busy
**Fix:** Wait 1-2 minutes and try again

### "429 Too Many Requests"
**Meaning:** You've hit the rate limit
**Fix:** Wait or upgrade your API plan

### "401 Unauthorized"
**Meaning:** Invalid API key
**Fix:** Check your API key in `.env.local`

### "400 Bad Request"
**Meaning:** Invalid input or model not available
**Fix:** Check model name in `genkit.ts`

## Prevention Tips

1. **Don't spam the generate button** - Wait for each request to complete
2. **Use reasonable quiz sizes** - Start with 5 questions, not 10
3. **Check API quotas regularly** - Monitor your usage
4. **Keep API key secure** - Don't share or commit it

## Still Not Working?

### Check 1: API Key is Set
```bash
# Check if API key exists
cat .env.local | grep GOOGLE_API_KEY
```

Should show your API key (not empty)

### Check 2: Restart Everything
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Check 3: Try Different Topic
Some topics might be filtered by Google's AI.

Try simple topics:
- "Mathematics"
- "Science"
- "History"
- "Geography"

Avoid:
- Controversial topics
- Medical advice
- Financial advice

## Alternative: Use Gemini Pro

If Flash model keeps failing, use Pro (slower but more reliable):

**Edit `src/ai/genkit.ts`:**
```typescript
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-pro',
});
```

Pro model:
- ✅ More reliable
- ✅ Better quality
- ❌ Slower
- ❌ Higher cost

## Summary

**Most likely cause:** Google's service is temporarily busy

**Quick fix:** 
1. Wait 1-2 minutes
2. Try again
3. Should work ✅

**If still failing:**
1. Check API key
2. Check quota
3. Try different model

---

**The fix is applied. Just wait a moment and try again!** 🎉
