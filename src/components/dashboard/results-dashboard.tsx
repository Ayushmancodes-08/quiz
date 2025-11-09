"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScoreDistributionChart } from "./score-distribution-chart";
import { MOCK_ATTEMPTS } from "@/lib/data";
import { summarizeResultsAction } from "@/lib/actions";
import { Loader2, TriangleAlert } from "lucide-react";

export function ResultsDashboard() {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getSummary() {
      const resultsJson = JSON.stringify(
        MOCK_ATTEMPTS.map(a => ({ score: a.score, violations: a.violations }))
      );
      
      const response = await summarizeResultsAction({
        quizName: "All Quizzes",
        results: resultsJson,
      });

      if (response.success && response.data) {
        setSummary(response.data.summary);
      } else {
        setSummary("Could not generate AI summary.");
      }
      setIsLoading(false);
    }
    getSummary();
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 gradient-border bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-headline text-glow-primary">AI Summary</CardTitle>
            <CardDescription>An AI-generated overview of recent quiz performance.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating summary...</span>
              </div>
            ) : (
              <p className="text-sm text-foreground/80">{summary}</p>
            )}
          </CardContent>
        </Card>
        <Card className="gradient-border bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-headline text-glow-primary">Score Distribution</CardTitle>
            <CardDescription>Distribution of scores across all attempts.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreDistributionChart data={MOCK_ATTEMPTS} />
          </CardContent>
        </Card>
      </div>
      
      <Card className="gradient-border bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-glow-primary">Recent Attempts</CardTitle>
          <CardDescription>A log of the most recent quiz attempts.</CardDescription>
        </CardHeader>
        <CardContent>
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
              {MOCK_ATTEMPTS.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell className="font-medium">{attempt.userName}</TableCell>
                  <TableCell>{attempt.quizTitle}</TableCell>
                  <TableCell>
                    <Badge variant={attempt.score > 70 ? "default" : "destructive"}>
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
        </CardContent>
      </Card>
    </div>
  );
}
