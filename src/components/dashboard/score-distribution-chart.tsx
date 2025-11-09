"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { QuizAttempt } from "@/lib/types";

interface ScoreDistributionChartProps {
  data: QuizAttempt[];
}

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  const scoreBuckets = [
    { name: "0-20", count: 0 },
    { name: "21-40", count: 0 },
    { name: "41-60", count: 0 },
    { name: "61-80", count: 0 },
    { name: "81-100", count: 0 },
  ];

  data.forEach((attempt) => {
    if (attempt.score <= 20) scoreBuckets[0].count++;
    else if (attempt.score <= 40) scoreBuckets[1].count++;
    else if (attempt.score <= 60) scoreBuckets[2].count++;
    else if (attempt.score <= 80) scoreBuckets[3].count++;
    else scoreBuckets[4].count++;
  });

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={scoreBuckets}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
        <XAxis
          dataKey="name"
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
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
          contentStyle={{
            background: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
        />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}