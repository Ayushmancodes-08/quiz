"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { QuizAttempt } from "@/lib/types";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface QuizBreakdownProps {
  attempts: QuizAttempt[];
}

export function QuizBreakdown({ attempts }: QuizBreakdownProps) {
  // Group attempts by quiz
  const quizStats = attempts.reduce((acc, attempt) => {
    const quizTitle = attempt.quizTitle;
    
    if (!acc[quizTitle]) {
      acc[quizTitle] = {
        title: quizTitle,
        total: 0,
        totalScore: 0,
        avgScore: 0,
        passing: 0,
        flagged: 0,
      };
    }
    
    acc[quizTitle].total += 1;
    acc[quizTitle].totalScore += attempt.score;
    acc[quizTitle].avgScore = Math.round(acc[quizTitle].totalScore / acc[quizTitle].total);
    
    if (attempt.score >= 70) {
      acc[quizTitle].passing += 1;
    }
    
    if (attempt.isFlagged || (attempt.violations && attempt.violations > 0)) {
      acc[quizTitle].flagged += 1;
    }
    
    return acc;
  }, {} as Record<string, {
    title: string;
    total: number;
    totalScore: number;
    avgScore: number;
    passing: number;
    flagged: number;
  }>);

  const quizData = Object.values(quizStats).sort((a, b) => b.total - a.total);

  const chartData = quizData.map(quiz => ({
    name: quiz.title.length > 20 ? quiz.title.substring(0, 20) + '...' : quiz.title,
    fullName: quiz.title,
    avgScore: quiz.avgScore,
    attempts: quiz.total,
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-glow-primary">Performance by Quiz</CardTitle>
          <CardDescription>Average scores and attempt counts for each quiz</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No quiz data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                  contentStyle={{
                    background: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                  formatter={(value: number, name: string) => {
                    if (name === 'avgScore') return [`${value}%`, 'Average Score'];
                    return [value, 'Attempts'];
                  }}
                />
                <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-glow-primary">Quiz Statistics</CardTitle>
          <CardDescription>Detailed breakdown by quiz</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz Title</TableHead>
                <TableHead className="text-center">Attempts</TableHead>
                <TableHead className="text-center">Avg Score</TableHead>
                <TableHead className="text-center">Passing</TableHead>
                <TableHead className="text-center">Flagged</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizData.map((quiz) => (
                <TableRow key={quiz.title}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell className="text-center">{quiz.total}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={quiz.avgScore >= 70 ? 'default' : 'destructive'}>
                      {quiz.avgScore}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {quiz.passing} ({Math.round((quiz.passing / quiz.total) * 100)}%)
                  </TableCell>
                  <TableCell className="text-center">
                    {quiz.flagged > 0 ? (
                      <Badge variant="destructive">{quiz.flagged}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

