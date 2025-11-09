"use server";

import { generateQuizFromTopic, type GenerateQuizFromTopicInput } from '@/ai/flows/generate-quiz-from-topic';
import { summarizeQuizResults, type SummarizeQuizResultsInput } from '@/ai/flows/summarize-quiz-results';

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
