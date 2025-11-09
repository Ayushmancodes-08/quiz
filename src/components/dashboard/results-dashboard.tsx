'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScoreDistributionChart } from './score-distribution-chart';
import { PerformanceTrendChart } from './performance-trend-chart';
import { StudentStatistics } from './student-statistics';
import { QuizBreakdown } from './quiz-breakdown';
import { StudentsByQuiz } from './students-by-quiz';
import { summarizeResultsAction } from '@/lib/actions';
import { Loader2, TriangleAlert } from 'lucide-react';
import { useUser, WithId } from '@/firebase';
import type { QuizAttempt } from '@/lib/types';
import { useFirebaseQuizAttempts } from '@/hooks/use-firebase-quiz-attempts';

export function ResultsDashboard() {
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const { user } = useUser();

  // Use Firebase for quiz attempts (real-time updates with Firestore)
  const { attempts, isLoading: areAttemptsLoading, error: queryError } = useFirebaseQuizAttempts(
    user?.uid || null
  );

  useEffect(() => {
    async function getSummary() {
      if (!attempts || attempts.length === 0) {
        setSummary('No quiz attempts have been recorded for your quizzes yet.');
        setIsSummaryLoading(false);
        return;
      }

      setIsSummaryLoading(true);
      const resultsJson = JSON.stringify(
        attempts.map(a => ({ quiz: a.quizTitle, score: a.score, violations: a.violations, flagged: a.isFlagged }))
      );

      const response = await summarizeResultsAction({
        quizName: 'All Quizzes', // We can specify this, but the data contains individual quiz titles.
        results: resultsJson,
      });

      if (response.success && response.data) {
        setSummary(response.data.summary);
      } else {
        setSummary('Could not generate AI summary at this time.');
      }
      setIsSummaryLoading(false);
    }
    getSummary();
  }, [attempts]);

  const recentAttempts = (attempts as WithId<QuizAttempt>[]) || [];
  
  // Show error message if there's a permission error
  if (queryError) {
    const isPermissionError = queryError.message?.includes('permission') || 
                             queryError.message?.includes('Permission') ||
                             queryError.code === 'permission-denied';
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-glow-primary text-destructive">Permission Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {isPermissionError 
                ? "Unable to load quiz attempts due to permission restrictions. Please ensure Firestore security rules are deployed."
                : `Error loading quiz attempts: ${queryError.message}`}
            </p>
            {isPermissionError && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="font-semibold">To fix this issue:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Deploy the updated Firestore security rules to your Firebase project</li>
                  <li>See <code className="bg-background px-1 rounded">FIREBASE_DEPLOYMENT.md</code> for instructions</li>
                  <li>Ensure you're authenticated with a valid user account</li>
                  <li>Verify the rules allow list operations on quiz_attempts for authenticated users</li>
                </ol>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (areAttemptsLoading && !attempts) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-4 text-muted-foreground">Loading results...</span>
      </div>
    );
  }

  if (!areAttemptsLoading && (!recentAttempts || recentAttempts.length === 0)) {
    return (
         <Card>
            <CardHeader>
                <CardTitle className="font-headline text-glow-primary">Results Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="py-8 text-center text-muted-foreground">No one has taken your quizzes yet. Share a quiz link to get started!</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Student Statistics Overview */}
      {!areAttemptsLoading && recentAttempts.length > 0 && (
        <StudentStatistics attempts={recentAttempts} />
      )}

      {/* AI Summary and Score Distribution */}
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
            <CardDescription>Distribution of scores across all recent attempts.</CardDescription>
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

      {/* Performance Trend Over Time */}
      {!areAttemptsLoading && recentAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-glow-primary">Performance Trend</CardTitle>
            <CardDescription>Average score trends over time across all quiz attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceTrendChart data={recentAttempts} />
          </CardContent>
        </Card>
      )}

      {/* Quiz Breakdown */}
      {!areAttemptsLoading && recentAttempts.length > 0 && (
        <QuizBreakdown attempts={recentAttempts} />
      )}

      {/* Students Grouped by Quiz */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-glow-primary">Students by Quiz</CardTitle>
          <CardDescription>
            All students organized by quiz - click on a quiz to view all student attempts ({recentAttempts.length} total attempts)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {areAttemptsLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <StudentsByQuiz attempts={recentAttempts} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
