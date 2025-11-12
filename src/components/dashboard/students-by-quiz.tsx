"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { QuizAttempt } from "@/lib/types";
import { TriangleAlert, ChevronDown, ChevronRight, Eye, Trash2, Trophy, Medal, Award } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSupabaseClient } from "@/supabase";
import { useToast } from "@/hooks/use-toast";

interface StudentsByQuizProps {
  attempts: QuizAttempt[];
}

export function StudentsByQuiz({ attempts }: StudentsByQuizProps) {
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  const [openQuizzes, setOpenQuizzes] = useState<Set<string>>(new Set());

  const handleDeleteAttempt = async (attemptId: string, studentName: string) => {
    try {
      const { error } = await supabase
        .from('quiz_attempts')
        .delete()
        .eq('id', attemptId);

      if (error) throw error;

      toast({
        title: "Attempt Deleted",
        description: `${studentName}'s attempt has been removed.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Could not delete the attempt.",
      });
    }
  };

  const handleDeleteAllQuizAttempts = async (quizId: string, quizTitle: string) => {
    try {
      const { error } = await supabase
        .from('quiz_attempts')
        .delete()
        .eq('quiz_id', quizId);

      if (error) throw error;

      toast({
        title: "All Attempts Deleted",
        description: `All attempts for "${quizTitle}" have been removed.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Could not delete attempts.",
      });
    }
  };

  const quizGroups = attempts.reduce((acc, attempt) => {
    const quizId = attempt.quizId;
    const quizTitle = attempt.quizTitle;
    
    if (!acc[quizId]) {
      acc[quizId] = {
        quizId,
        quizTitle,
        attempts: [],
        totalAttempts: 0,
        avgScore: 0,
        passingCount: 0,
        flaggedCount: 0,
      };
    }
    
    acc[quizId].attempts.push(attempt);
    acc[quizId].totalAttempts += 1;
    
    return acc;
  }, {} as Record<string, {
    quizId: string;
    quizTitle: string;
    attempts: QuizAttempt[];
    totalAttempts: number;
    avgScore: number;
    passingCount: number;
    flaggedCount: number;
  }>);

  Object.values(quizGroups).forEach(quiz => {
    if (quiz.attempts.length > 0) {
      const totalScore = quiz.attempts.reduce((sum, a) => sum + a.score, 0);
      quiz.avgScore = Math.round(totalScore / quiz.attempts.length);
      quiz.passingCount = quiz.attempts.filter(a => a.score >= 70).length;
      quiz.flaggedCount = quiz.attempts.filter(a => a.isFlagged || (a.violations && a.violations > 0)).length;
    }
  });

  const sortedQuizzes = Object.values(quizGroups).sort((a, b) => 
    a.quizTitle.localeCompare(b.quizTitle)
  );

  sortedQuizzes.forEach(quiz => {
    quiz.attempts.sort((a, b) => b.score - a.score);
  });

  const toggleQuiz = (quizId: string) => {
    setOpenQuizzes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(quizId)) {
        newSet.delete(quizId);
      } else {
        newSet.add(quizId);
      }
      return newSet;
    });
  };

  if (sortedQuizzes.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No quiz attempts found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedQuizzes.map((quiz) => {
        const isOpen = openQuizzes.has(quiz.quizId);
        const uniqueStudents = new Set(
          quiz.attempts.map(a => `${a.studentName}-${a.registrationNumber}`)
        ).size;

        return (
          <Card key={quiz.quizId}>
            <Collapsible open={isOpen} onOpenChange={() => toggleQuiz(quiz.quizId)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex-1 justify-start p-0 h-auto hover:bg-transparent"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          {isOpen ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div className="text-left">
                            <CardTitle className="font-headline text-xl">{quiz.quizTitle}</CardTitle>
                            <CardDescription className="mt-1">
                              {quiz.totalAttempts} attempt{quiz.totalAttempts !== 1 ? 's' : ''} • {uniqueStudents} student{uniqueStudents !== 1 ? 's' : ''}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold">{quiz.avgScore}%</div>
                            <div className="text-xs text-muted-foreground">Avg Score</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{quiz.passingCount}</div>
                            <div className="text-xs text-muted-foreground">Passing</div>
                          </div>
                          {quiz.flaggedCount > 0 && (
                            <div className="text-center">
                              <div className="font-semibold text-destructive">{quiz.flaggedCount}</div>
                              <div className="text-xs text-muted-foreground">Flagged</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete All Attempts?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all {quiz.totalAttempts} attempt{quiz.totalAttempts !== 1 ? 's' : ''} for "{quiz.quizTitle}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteAllQuizAttempts(quiz.quizId, quiz.quizTitle)}>
                          Delete All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-3">
                    {quiz.attempts.map((attempt, index) => {
                      const rank = index + 1;
                      const isTopThree = rank <= 3;
                      
                      return (
                        <div 
                          key={attempt.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border ${
                            isTopThree ? 'bg-gradient-to-r from-primary/5 to-transparent border-primary/20' : 'bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background border-2 font-bold">
                            {rank === 1 && <Trophy className="h-6 w-6 text-yellow-500" />}
                            {rank === 2 && <Medal className="h-6 w-6 text-gray-400" />}
                            {rank === 3 && <Award className="h-6 w-6 text-amber-600" />}
                            {rank > 3 && <span className="text-muted-foreground">#{rank}</span>}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold truncate">
                                {attempt.studentName || attempt.userName || 'Anonymous'}
                              </p>
                              {attempt.isFlagged && (
                                <TriangleAlert className="h-4 w-4 text-destructive flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {attempt.registrationNumber || 'N/A'} • {new Date(attempt.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <Badge variant={attempt.score >= 70 ? 'default' : 'destructive'} className="text-lg px-3 py-1">
                                {attempt.score}%
                              </Badge>
                              {attempt.violations > 0 && (
                                <p className="text-xs text-destructive mt-1">
                                  {attempt.violations} violation{attempt.violations !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/quiz/review/${attempt.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Attempt?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete {attempt.studentName}'s attempt. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteAttempt(attempt.id, attempt.studentName)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}

