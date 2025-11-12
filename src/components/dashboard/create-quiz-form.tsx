
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { generateQuizAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Question, Quiz } from '@/lib/types';
import { Loader2, Save, Wand2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { useSupabaseClient, useUser } from '@/supabase';

const formSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  numQuestions: z.coerce.number().int().min(1).max(10),
  title: z.string().min(3, 'Title must be at least 3 characters long.')
});

export function CreateQuizForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<Omit<Quiz, 'authorId' | 'createdAt'> | null>(null);
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      title: '',
      difficulty: 'medium',
      numQuestions: 5,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    setGeneratedQuiz(null);
    try {
      const result = await generateQuizAction(values);
      if (result.success && result.data) {
        setGeneratedQuiz({
          title: values.title,
          topic: values.topic,
          difficulty: values.difficulty,
          questions: result.data.quiz,
        });
        toast({
          title: 'Quiz Generated!',
          description: 'Review and edit the questions below before saving.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: result.error || 'An unknown error occurred.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error.message || 'An unexpected error occurred while generating the quiz.',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSaveQuiz() {
    if (!generatedQuiz || !user) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Cannot save quiz. Not authenticated or quiz not generated.',
      });
      return;
    }
    
    setIsSaving(true);
    
    const quizToSave: Quiz = {
      ...generatedQuiz,
      authorId: user.id,
      createdAt: new Date().toISOString(),
    };

    // Validate authorId is set correctly
    if (!quizToSave.authorId || quizToSave.authorId !== user.id) {
      console.error('Author ID validation failed:', { authorId: quizToSave.authorId, userId: user.id });
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Author ID mismatch. Please try again.',
      });
      setIsSaving(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          author_id: quizToSave.authorId,
          title: quizToSave.title,
          topic: quizToSave.topic,
          difficulty: quizToSave.difficulty,
          questions: quizToSave.questions as any,
          created_at: quizToSave.createdAt,
        } as any)
        .select()
        .single();

      if (error) throw error;
      
      console.log('Quiz saved successfully:', data);
      
      toast({
        title: 'Quiz Saved!',
        description: 'The quiz is now available in "My Quizzes" and can be shared.',
      });
      setGeneratedQuiz(null);
      form.reset();
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        full: error
      });
      
      const errorMessage = error.message || 'Could not save the quiz to the database.';
      
      // Check for table not found error
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        toast({
          variant: 'destructive',
          title: 'Database Not Set Up',
          description: '⚠️ Tables not created! Run migrations in Supabase SQL Editor. See README_FIRST.md',
        });
      } else if (error.code === '42P01') {
        // PostgreSQL error code for undefined table
        toast({
          variant: 'destructive',
          title: 'Database Not Set Up',
          description: '⚠️ The "quizzes" table does not exist. Run migrations in Supabase SQL Editor.',
        });
      } else if (error.code === 'PGRST116') {
        // PostgREST error for table not found
        toast({
          variant: 'destructive',
          title: 'Database Not Set Up',
          description: '⚠️ Tables not found in schema cache. Run migrations: See FIX_ERRORS_NOW.md',
        });
      } else if (error.message?.includes('JWT')) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Please sign out and sign in again.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Save Error',
          description: `${errorMessage} (Check console for details)`,
        });
      }
    } finally {
      setIsSaving(false);
    }
  }

  function handleQuestionChange(questionIndex: number, newText: string) {
    if (generatedQuiz) {
      const updatedQuestions = [...generatedQuiz.questions];
      updatedQuestions[questionIndex].question = newText;
      setGeneratedQuiz({ ...generatedQuiz, questions: updatedQuestions });
    }
  }

  function handleOptionChange(questionIndex: number, optionIndex: number, newText: string) {
    if (generatedQuiz) {
      const updatedQuestions = [...generatedQuiz.questions];
      updatedQuestions[questionIndex].options[optionIndex] = newText;
      setGeneratedQuiz({ ...generatedQuiz, questions: updatedQuestions });
    }
  }
  
  function handleCorrectAnswerChange(questionIndex: number, newCorrectAnswer: string) {
    if (generatedQuiz) {
      const updatedQuestions = [...generatedQuiz.questions];
      updatedQuestions[questionIndex].correctAnswer = newCorrectAnswer;
      setGeneratedQuiz({ ...generatedQuiz, questions: updatedQuestions });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Generate a New Quiz</CardTitle>
        <CardDescription>Use AI to create a quiz on any topic in seconds.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
             <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quiz Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., World Capitals Challenge" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Renaissance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Quiz
            </Button>
          </CardFooter>
        </form>
      </Form>
      {generatedQuiz && (
        <div className="border-t p-6">
          <h3 className="mb-4 text-xl font-bold font-headline">Review Generated Quiz</h3>
          <Accordion type="single" collapsible className="w-full">
            {generatedQuiz.questions.map((q, qIndex) => (
              <AccordionItem key={qIndex} value={`item-${qIndex}`}>
                <AccordionTrigger className="font-headline text-left">Question {qIndex + 1}: {q.question}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-2">
                    <div className="space-y-2">
                      <Label htmlFor={`question-${qIndex}`}>Question Text</Label>
                      <Textarea 
                        id={`question-${qIndex}`}
                        value={q.question}
                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Options & Correct Answer</Label>
                      <RadioGroup 
                        value={q.correctAnswer} 
                        onValueChange={(value) => handleCorrectAnswerChange(qIndex, value)}
                        className="space-y-2"
                      >
                        {q.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`q${qIndex}-option${oIndex}`} />
                            <Input 
                              id={`q${qIndex}-option-text-${oIndex}`}
                              value={option}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                              className="text-base"
                             />
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveQuiz} disabled={isSaving}>
               {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Quiz
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
