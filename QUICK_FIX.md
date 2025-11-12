# Quick Fix - Model Not Found Error

## Error
"404 Not Found - gemini-1.5-flash is not found"

## Solution Applied
Changed model name to: `gemini-1.5-flash-latest`

## What to Do Now

### Step 1: Restart Dev Server
```bash
# Press Ctrl+C to stop
npm run dev
```

### Step 2: Try Creating Quiz
Should work now! ✅

## If Still Not Working

Try using `gemini-pro` instead:

**Edit `src/ai/genkit.ts`:**
```typescript
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-pro',  // Change to this
});
```

Then restart: `npm run dev`

## Available Models

Try these in order:
1. `googleai/gemini-1.5-flash-latest` ✅ (Fast, cheap)
2. `googleai/gemini-pro` (Reliable)
3. `googleai/gemini-1.5-pro-latest` (Best quality)

---

**Just restart your server and try again!** 🚀
