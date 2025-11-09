"use server";

import { generateQuizFromTopic, type GenerateQuizFromTopicInput } from '@/ai/flows/generate-quiz-from-topic';
import { summarizeQuizResults, type SummarizeQuizResultsInput } from '@/ai/flows/summarize-quiz-results';
import { detectAndFlagCheating, type DetectAndFlagCheatingInput } from '@/ai/flows/detect-and-flag-cheating';

export async function generateQuizAction(input: GenerateQuizFromTopicInput) {
  try {
    const result = await generateQuizFromTopic(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating quiz:", error);
    return { success: false, error: "Failed to generate quiz. Please try again." };
  }
}

export async function summarizeResultsAction(input: SummarizeQuizResultsInput) {
    try {
        const result = await summarizeQuizResults(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error summarizing results:", error);
        return { success: false, error: "Failed to summarize results." };
    }
}

export async function detectAndFlagCheatingAction(input: DetectAndFlagCheatingInput) {
    try {
        const result = await detectAndFlagCheating(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error detecting cheating:", error);
        return { success: false, error: "Failed to detect cheating." };
    }
}
