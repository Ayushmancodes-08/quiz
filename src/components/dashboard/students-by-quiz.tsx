"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { QuizAttempt } from "@/lib/types";
import { TriangleAlert, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface StudentsByQuizProps {
  attempts: QuizAttempt[];
}

export function StudentsByQuiz({ attempts }: StudentsByQuizProps) {
  // Group attempts by quiz
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

  // Calculate statistics for each quiz
  Object.values(quizGroups).forEach(quiz => {
    if (quiz.attempts.length > 0) {
      const totalScore = quiz.attempts.reduce((sum, a) => sum + a.score, 0);
      quiz.avgScore = Math.round(totalScore / quiz.attempts.length);
      quiz.passingCount = quiz.attempts.filter(a => a.score >= 70).length;
      quiz.flaggedCount = quiz.attempts.filter(a => a.isFlagged || (a.violations && a.violations > 0)).length;
    }
  });

  // Sort quizzes by title
  const sortedQuizzes = Object.values(quizGroups).sort((a, b) => 
    a.quizTitle.localeCompare(b.quizTitle)
  );

  // Sort attempts within each quiz by completion date (most recent first)
  sortedQuizzes.forEach(quiz => {
    quiz.attempts.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  });

  const [openQuizzes, setOpenQuizzes] = useState<Set<string>>(new Set());

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
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-0 h-auto hover:bg-transparent"
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
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Registration Number</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead className="text-center">Violations</TableHead>
                        <TableHead className="text-center">Flagged</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quiz.attempts.map((attempt) => (
                        <TableRow key={attempt.id}>
                          <TableCell className="font-medium">
                            {attempt.studentName || attempt.userName || 'Anonymous'}
                          </TableCell>
                          <TableCell>{attempt.registrationNumber || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={attempt.score >= 70 ? 'default' : 'destructive'}>
                              {attempt.score}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {attempt.violations && attempt.violations > 0 ? (
                              <Badge variant="destructive">{attempt.violations}</Badge>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {attempt.isFlagged ? (
                              <span 
                                title="Flagged for suspicious activity" 
                                className="inline-flex items-center text-destructive"
                              >
                                <TriangleAlert className="h-5 w-5" />
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{new Date(attempt.completedAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}

