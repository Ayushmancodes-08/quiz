"use server";

import { generateQuizFromTopic, type GenerateQuizFromTopicInput } from '@/ai/flows/generate-quiz-from-topic';
import { summarizeQuizResults, type SummarizeQuizResultsInput } from '@/ai/flows/summarize-quiz-results';
import { detectAndFlagCheating, type DetectAndFlagCheatingInput } from '@/ai/flows/detect-and-flag-cheating';

export async function generateQuizAction(input: GenerateQuizFromTopicInput) {
  try {
    // Input validation
    if (!input.topic || typeof input.topic !== 'string' || input.topic.trim().length < 3) {
      return { success: false, error: "Topic must be at least 3 characters long." };
    }
    if (!input.difficulty || !['easy', 'medium', 'hard'].includes(input.difficulty)) {
      return { success: false, error: "Invalid difficulty level." };
    }
    if (!input.numQuestions || typeof input.numQuestions !== 'number' || input.numQuestions < 1 || input.numQuestions > 10) {
      return { success: false, error: "Number of questions must be between 1 and 10." };
    }

    const result = await generateQuizFromTopic(input);
    
    // Result validation
    if (!result || !result.quiz || !Array.isArray(result.quiz) || result.quiz.length === 0) {
      return { success: false, error: "Generated quiz is invalid or empty." };
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    const errorMessage = error?.message || "Failed to generate quiz. Please try again.";
    return { success: false, error: errorMessage };
  }
}

export async function summarizeResultsAction(input: SummarizeQuizResultsInput) {
    try {
        // Input validation
        if (!input || typeof input !== 'object') {
            return { success: false, error: "Invalid input provided." };
        }

        const result = await summarizeQuizResults(input);
        
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

        const result = await detectAndFlagCheating(input);
        
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
