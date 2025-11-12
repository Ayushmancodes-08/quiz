# Gemini Model Fix

## The Issue
Model names keep changing. The correct current model is:
```
googleai/gemini-2.0-flash-exp
```

## What I Changed
Updated `src/ai/genkit.ts` to use the correct model name.

## Restart Required
```bash
# Stop server (Ctrl+C)
npm run dev
```

## If Still Not Working

Try these models in order:

### Option 1: Gemini 2.0 Flash (Current)
```typescript
model: 'googleai/gemini-2.0-flash-exp'
```

### Option 2: Gemini Pro (Most Stable)
```typescript
model: 'googleai/gemini-pro'
```

### Option 3: Gemini 1.5 Pro
```typescript
model: 'googleai/gemini-1.5-pro'
```

## How to Change Model

Edit `src/ai/genkit.ts`:
```typescript
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-pro',  // Change this line
});
```

Then restart: `npm run dev`

---

**Restart your server now and try again!** 🚀
