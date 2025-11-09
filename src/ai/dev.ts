import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-quiz-results.ts';
import '@/ai/flows/generate-quiz-from-topic.ts';
import '@/ai/flows/detect-and-flag-cheating.ts';