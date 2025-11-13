import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { getApiKeyManager } from '@/lib/api-key-manager';

// Get the first available API key for initialization
function getInitialApiKey(): string {
  const manager = getApiKeyManager();
  const key = manager.getNextKey();
  if (!key) {
    throw new Error('No API keys available');
  }
  return key;
}

export const ai = genkit({
  plugins: [googleAI({ apiKey: getInitialApiKey() })],
  model: 'googleai/gemini-2.5-flash',
});
