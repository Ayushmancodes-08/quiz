'use server';

/**
 * @fileOverview A flow to summarize quiz results using AI.
 *
 * - summarizeQuizResults - A function that summarizes the quiz results.
 * - SummarizeQuizResultsInput - The input type for the summarizeQuizResults function.
 * - SummarizeQuizResultsOutput - The return type for the summarizeQuizResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeQuizResultsInputSchema = z.object({
  quizName: z.string().describe('The name of the quiz.'),
  results: z.string().describe('The quiz results in JSON format.'),
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
  input: {schema: SummarizeQuizResultsInputSchema},
  output: {schema: SummarizeQuizResultsOutputSchema},
  prompt: `You are an AI assistant that helps users analyze quiz results.

You are given the name of the quiz and the results from various participants. The results are in JSON format.

Your job is to summarize the results, identify overall performance trends, and highlight any interesting patterns or outliers.

Quiz Name: {{{quizName}}}
Quiz Results: {{{results}}}

Summary:`,
});

const summarizeQuizResultsFlow = ai.defineFlow(
  {
    name: 'summarizeQuizResultsFlow',
    inputSchema: SummarizeQuizResultsInputSchema,
    outputSchema: SummarizeQuizResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
