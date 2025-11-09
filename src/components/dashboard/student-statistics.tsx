"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { QuizAttempt } from "@/lib/types";
import { Users, TrendingUp, AlertTriangle, Award } from "lucide-react";

interface StudentStatisticsProps {
  attempts: QuizAttempt[];
}

export function StudentStatistics({ attempts }: StudentStatisticsProps) {
  // Get unique students
  const uniqueStudents = new Set(
    attempts.map(a => `${a.studentName}-${a.registrationNumber}`)
  ).size;

  // Calculate average score
  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
    : 0;

  // Count flagged attempts
  const flaggedCount = attempts.filter(a => a.isFlagged || (a.violations && a.violations > 0)).length;
  const flaggedPercentage = attempts.length > 0
    ? Math.round((flaggedCount / attempts.length) * 100)
    : 0;

  // Count passing attempts (>= 70%)
  const passingCount = attempts.filter(a => a.score >= 70).length;
  const passingPercentage = attempts.length > 0
    ? Math.round((passingCount / attempts.length) * 100)
    : 0;

  // Calculate total violations
  const totalViolations = attempts.reduce((sum, a) => sum + (a.violations || 0), 0);

  const stats = [
    {
      title: "Total Students",
      value: uniqueStudents,
      description: `${attempts.length} total attempts`,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Average Score",
      value: `${avgScore}%`,
      description: `${passingCount} passing (≥70%)`,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Flagged Attempts",
      value: flaggedCount,
      description: `${flaggedPercentage}% of attempts`,
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      title: "Pass Rate",
      value: `${passingPercentage}%`,
      description: `${passingCount} out of ${attempts.length}`,
      icon: Award,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

