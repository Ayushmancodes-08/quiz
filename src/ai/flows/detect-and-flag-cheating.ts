'use server';
/**
 * @fileOverview Implements the DetectAndFlagCheating flow for identifying potential cheating during a quiz.
 *
 * - detectAndFlagCheating - A function that detects cheating attempts.
 * - DetectAndFlagCheatingInput - The input type for the detectAndFlagCheating function.
 * - DetectAndFlagCheatingOutput - The return type for the detectAndFlagCheating function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectAndFlagCheatingInputSchema = z.object({
  quizAttemptDetails: z.string().describe('The details of the quiz attempt, including tab switch count, time taken, and other relevant information.'),
  userDetails: z.string().describe('Information about the user taking the quiz, such as their name and ID.'),
  quizDetails: z.string().describe('Details about the quiz itself, such as the topic and difficulty level.'),
});
export type DetectAndFlagCheatingInput = z.infer<typeof DetectAndFlagCheatingInputSchema>;

const DetectAndFlagCheatingOutputSchema = z.object({
  isCheating: z.boolean().describe('Whether or not the quiz attempt is flagged as cheating.'),
  reason: z.string().describe('The reason for flagging the attempt as cheating.'),
});
export type DetectAndFlagCheatingOutput = z.infer<typeof DetectAndFlagCheatingOutputSchema>;

export async function detectAndFlagCheating(input: DetectAndFlagCheatingInput): Promise<DetectAndFlagCheatingOutput> {
  return detectAndFlagCheatingFlow(input);
}

const detectAndFlagCheatingPrompt = ai.definePrompt({
  name: 'detectAndFlagCheatingPrompt',
  input: {schema: DetectAndFlagCheatingInputSchema},
  output: {schema: DetectAndFlagCheatingOutputSchema},
  prompt: `You are an AI assistant specialized in detecting cheating attempts during online quizzes.

  Analyze the following information to determine if the user is cheating.

  Quiz Attempt Details: {{{quizAttemptDetails}}}
  User Details: {{{userDetails}}}
  Quiz Details: {{{quizDetails}}}

  Based on the provided details, determine if the user is likely cheating. Provide a reason for your determination.
  Indicate your answer with the isCheating boolean output field.
  `,
});

const detectAndFlagCheatingFlow = ai.defineFlow(
  {
    name: 'detectAndFlagCheatingFlow',
    inputSchema: DetectAndFlagCheatingInputSchema,
    outputSchema: DetectAndFlagCheatingOutputSchema,
  },
  async input => {
    const {output} = await detectAndFlagCheatingPrompt(input);
    return output!;
  }
);
