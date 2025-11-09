'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScoreDistributionChart } from './score-distribution-chart';
import { summarizeResultsAction } from '@/lib/actions';
import { Loader2, TriangleAlert } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, WithId } from '@/firebase';
import type { QuizAttempt } from '@/lib/types';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';

export function ResultsDashboard() {
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const { user } = useUser();
  const firestore = useFirestore();

  const attemptsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // Query all attempts made by any user on quizzes created by the current user.
    // This requires a composite index on authorId and createdAt.
    // For now, let's fetch the user's own attempts.
    return query(
      collection(firestore, `users/${user.uid}/quiz_attempts`),
      orderBy('completedAt', 'desc'),
      limit(20)
    );
  }, [user, firestore]);

  const { data: attempts, isLoading: areAttemptsLoading } = useCollection<QuizAttempt>(attemptsQuery);

  useEffect(() => {
    async function getSummary() {
      if (!attempts || attempts.length === 0) {
        setSummary('No quiz attempts recorded yet to generate a summary.');
        setIsSummaryLoading(false);
        return;
      }

      setIsSummaryLoading(true);
      const resultsJson = JSON.stringify(
        attempts.map(a => ({ score: a.score, violations: a.violations }))
      );

      const response = await summarizeResultsAction({
        quizName: 'All Quizzes',
        results: resultsJson,
      });

      if (response.success && response.data) {
        setSummary(response.data.summary);
      } else {
        setSummary('Could not generate AI summary.');
      }
      setIsSummaryLoading(false);
    }
    getSummary();
  }, [attempts]);

  const recentAttempts = (attempts as WithId<QuizAttempt>[]) || [];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-glow-primary">AI Summary</CardTitle>
            <CardDescription>An AI-generated overview of recent quiz performance.</CardDescription>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating summary...</span>
              </div>
            ) : (
              <p className="text-sm text-foreground/80">{summary}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-glow-primary">Score Distribution</CardTitle>
            <CardDescription>Distribution of scores across all attempts.</CardDescription>
          </CardHeader>
          <CardContent>
            {areAttemptsLoading ? (
               <div className="flex h-[250px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
            ) : (
              <ScoreDistributionChart data={recentAttempts} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-glow-primary">Recent Attempts</CardTitle>
          <CardDescription>A log of the most recent quiz attempts from your quizzes.</CardDescription>
        </CardHeader>
        <CardContent>
           {areAttemptsLoading ? (
               <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
            ) : recentAttempts.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No one has taken your quizzes yet.</p>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Quiz</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-center">Flagged</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAttempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell className="font-medium">{attempt.userName}</TableCell>
                  <TableCell>{attempt.quizTitle}</TableCell>
                  <TableCell>
                    <Badge variant={attempt.score > 70 ? 'default' : 'destructive'}>
                      {attempt.score}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {attempt.isFlagged && (
                      <span className="inline-flex items-center text-destructive">
                        <TriangleAlert className="h-5 w-5" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(attempt.completedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
