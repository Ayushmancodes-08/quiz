'use server';

/**
 * @fileOverview A flow to summarize quiz results using AI.
 *
 * - summarizeQuizResults - A function that summarizes the quiz results.
 * - SummarizeQuizResultsInput - The input type for the summarizeQuizResults function.
 * - SummarizeQuizResultsOutput - The return type for the summarizeQuizResults function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeQuizResultsInputSchema = z.object({
  quizName: z.string().describe('The name of the quiz or context for the results.'),
  results: z.string().describe('The quiz results in JSON format. Each result can contain quizTitle, score, violations, etc.'),
});
export type SummarizeQuizResultsInput = z.infer<typeof SummarizeQuizResultsInputSchema>;

const SummarizeQuizResultsOutputSchema = z.object({
  summary: z.string().describe('A summary of the quiz results.'),
});
export type SummarizeQuizResultsOutput = z.infer<typeof SummarizeQuizResultsOutputSchema>;

export async function summarizeQuizResults(input: SummarizeQuizResultsInput): Promise<SummarizeQuizResultsOutput> {
  return summarizeQuizResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeQuizResultsPrompt',
  input: { schema: SummarizeQuizResultsInputSchema },
  output: { schema: SummarizeQuizResultsOutputSchema },
  prompt: `You are an AI assistant that helps analyze quiz results for a user.

You are given a set of results from various participants across one or more quizzes. The results are in JSON format.

Your job is to summarize the results, identify overall performance trends (like average scores, common difficult quizzes), and highlight any interesting patterns or outliers (like high violation counts or exceptionally high/low scores).

Context: {{{quizName}}}
Quiz Results Data: {{{results}}}

Please provide a concise, analytical summary. Specifically, analyze academic integrity by looking at violation counts and types (if provided, e.g. "Tab Switch", "Security Violation"). Identify if specific students are repeatedly flagged.`,
});

const summarizeQuizResultsFlow = ai.defineFlow(
  {
    name: 'summarizeQuizResultsFlow',
    inputSchema: SummarizeQuizResultsInputSchema,
    outputSchema: SummarizeQuizResultsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
