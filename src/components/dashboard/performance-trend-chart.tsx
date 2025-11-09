"use client";

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import type { QuizAttempt } from "@/lib/types";

interface PerformanceTrendChartProps {
  data: QuizAttempt[];
}

export function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
  // Group attempts by date and calculate average score per day
  const dailyData = data.reduce((acc, attempt) => {
    const attemptDate = new Date(attempt.completedAt);
    // Use ISO date string for proper sorting, then format for display
    const dateKey = attemptDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const dateDisplay = attemptDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    if (!acc[dateKey]) {
      acc[dateKey] = { date: dateDisplay, dateKey, totalScore: 0, count: 0, avgScore: 0 };
    }
    acc[dateKey].totalScore += attempt.score;
    acc[dateKey].count += 1;
    acc[dateKey].avgScore = Math.round(acc[dateKey].totalScore / acc[dateKey].count);
    
    return acc;
  }, {} as Record<string, { date: string; dateKey: string; totalScore: number; count: number; avgScore: number }>);

  const chartData = Object.values(dailyData).sort((a, b) => {
    return a.dateKey.localeCompare(b.dateKey);
  });

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No data available for trend analysis
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
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
          cursor={{ stroke: 'hsl(var(--primary) / 0.2)' }}
          contentStyle={{
            background: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
          formatter={(value: number) => [`${value}%`, 'Average Score']}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="avgScore" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={{ fill: "hsl(var(--primary))", r: 4 }}
          name="Average Score"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

