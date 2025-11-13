"use server";

import { generateQuizFromTopic, type GenerateQuizFromTopicInput } from '@/ai/flows/generate-quiz-from-topic';
import { summarizeQuizResults, type SummarizeQuizResultsInput } from '@/ai/flows/summarize-quiz-results';
import { detectAndFlagCheating, type DetectAndFlagCheatingInput } from '@/ai/flows/detect-and-flag-cheating';
import { executeWithKeyRotation, getApiKeyManager } from '@/lib/api-key-manager';

export async function generateQuizAction(input: GenerateQuizFromTopicInput) {
  try {
    if (!input.topic || typeof input.topic !== 'string' || input.topic.trim().length < 3) {
      return { success: false, error: "Topic must be at least 3 characters long." };
    }
    if (!input.difficulty || !['easy', 'medium', 'hard'].includes(input.difficulty)) {
      return { success: false, error: "Invalid difficulty level." };
    }
    if (!input.numQuestions || typeof input.numQuestions !== 'number' || input.numQuestions < 1 || input.numQuestions > 10) {
      return { success: false, error: "Number of questions must be between 1 and 10." };
    }

    // Use key rotation for automatic failover
    const result = await executeWithKeyRotation(async (apiKey) => {
      // Set the API key for this request
      process.env.GOOGLE_API_KEY = apiKey;
      return await generateQuizFromTopic(input);
    });
    
    if (!result || !result.quiz || !Array.isArray(result.quiz) || result.quiz.length === 0) {
      return { success: false, error: "Generated quiz is invalid or empty." };
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    
    let errorMessage = "Failed to generate quiz. Please try again.";
    
    const manager = getApiKeyManager();
    const availableKeys = manager.getAvailableKeysCount();
    const totalKeys = manager.getTotalKeys();
    
    if (error?.message?.includes('503') || error?.message?.includes('overloaded')) {
      errorMessage = `Google AI service is temporarily overloaded. Tried ${totalKeys} API key(s). Please wait a moment and try again.`;
    } else if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      errorMessage = `API quota exceeded on all ${totalKeys} key(s). Please try again later.`;
    } else if (error?.message?.includes('No available API keys')) {
      errorMessage = `All ${totalKeys} API key(s) are currently rate-limited. Please wait a few minutes and try again.`;
    } else if (error?.message?.includes('401') || error?.message?.includes('API key')) {
      errorMessage = "Invalid API key. Please check your Google AI API key configuration.";
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}

export async function summarizeResultsAction(input: SummarizeQuizResultsInput) {
    try {
        // Input validation
        if (!input || typeof input !== 'object') {
            return { success: false, error: "Invalid input provided." };
        }

        // Use key rotation for automatic failover
        const result = await executeWithKeyRotation(async (apiKey) => {
            process.env.GOOGLE_API_KEY = apiKey;
            return await summarizeQuizResults(input);
        });
        
        // Result validation
        if (!result) {
            return { success: false, error: "Failed to generate summary." };
        }

        return { success: true, data: result };
    } catch (error: any) {
        console.error("Error summarizing results:", error);
        const errorMessage = error?.message || "Failed to summarize results.";
        return { success: false, error: errorMessage };
    }
}

export async function detectAndFlagCheatingAction(input: DetectAndFlagCheatingInput) {
    try {
        // Input validation
        if (!input || typeof input !== 'object') {
            return { success: false, error: "Invalid input provided." };
        }
        if (!input.quizAttemptDetails || !input.userDetails || !input.quizDetails) {
            return { success: false, error: "Missing required input fields." };
        }

        // Use key rotation for automatic failover
        const result = await executeWithKeyRotation(async (apiKey) => {
            process.env.GOOGLE_API_KEY = apiKey;
            return await detectAndFlagCheating(input);
        });
        
        // Result validation
        if (!result || typeof result.isCheating !== 'boolean') {
            return { success: false, error: "Invalid result from cheat detection." };
        }

        return { success: true, data: result };
    } catch (error: any) {
        console.error("Error detecting cheating:", error);
        const errorMessage = error?.message || "Failed to detect cheating.";
        return { success: false, error: errorMessage };
    }
}
