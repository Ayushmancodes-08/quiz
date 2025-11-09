'use server';

/**
 * @fileOverview Generates a quiz based on a topic, difficulty, and number of questions.
 *
 * - generateQuizFromTopic - A function that handles the quiz generation process.
 * - GenerateQuizFromTopicInput - The input type for the generateQuizFromTopic function.
 * - GenerateQuizFromTopicOutput - The return type for the generateQuizFromTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizFromTopicInputSchema = z.object({
  topic: z.string().describe('The topic of the quiz.'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty of the quiz.'),
  numQuestions: z.number().int().positive().describe('The number of questions in the quiz.'),
});
export type GenerateQuizFromTopicInput = z.infer<typeof GenerateQuizFromTopicInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string().describe('The text of the question.'),
  options: z.array(z.string()).describe('The possible answers to the question.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
});

const GenerateQuizFromTopicOutputSchema = z.object({
  quiz: z.array(QuizQuestionSchema).describe('The generated quiz questions.'),
});

export type GenerateQuizFromTopicOutput = z.infer<typeof GenerateQuizFromTopicOutputSchema>;

export async function generateQuizFromTopic(
  input: GenerateQuizFromTopicInput
): Promise<GenerateQuizFromTopicOutput> {
  return generateQuizFromTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizFromTopicPrompt',
  input: {schema: GenerateQuizFromTopicInputSchema},
  output: {schema: GenerateQuizFromTopicOutputSchema},
  prompt: `You are a quiz generator AI. Generate a unique quiz on the topic of {{{topic}}} with {{{numQuestions}}} questions of {{{difficulty}}} difficulty. Do not repeat questions you have generated before for this topic.

      The quiz should be returned as a JSON array of question objects.

      Each question objects should have the following keys:
      - question: The text of the question.
      - options: An array of possible answers to the question. There should always be 4 options in the array. 
      - correctAnswer: The correct answer to the question. This should be one of the options in the options array.
      Ensure that only one answer is correct.

      The JSON must be valid and parsable.
      Here's an example of the format:
      {
        "quiz": [
          {
            "question": "What is the capital of France?",
            "options": ["Berlin", "Paris", "London", "Rome"],
            "correctAnswer": "Paris"
          },
          {
            "question": "What is 2 + 2?",
            "options": ["3", "4", "5", "6"],
            "correctAnswer": "4"
          }
        ]
      }`,
});

const generateQuizFromTopicFlow = ai.defineFlow(
  {
    name: 'generateQuizFromTopicFlow',
    inputSchema: GenerateQuizFromTopicInputSchema,
    outputSchema: GenerateQuizFromTopicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
