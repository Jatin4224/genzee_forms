"use client";

import Link from "next/link";
import { IconClipboardText } from "@tabler/icons-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useDashboardStats } from "~/hooks/api/form";
import { EmptyState } from "~/components/empty-state";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import { Skeleton } from "~/components/ui/skeleton";

const chartConfig = {
  count: {
    label: "Responses",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function shortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function StatTile({ label, value, index }: { label: string; value: number; index: number }) {
  return (
    <Card
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 transition-shadow hover:shadow-elevate-lg"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <CardHeader className="gap-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export function DashboardOverview() {
  const { stats, isLoading } = useDashboardStats();

  if (isLoading || !stats) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total forms" value={stats.totalForms} index={0} />
        <StatTile label="Published" value={stats.publishedForms} index={1} />
        <StatTile label="Drafts" value={stats.draftForms} index={2} />
        <StatTile label="Total responses" value={stats.totalResponses} index={3} />
      </div>

      {/* Submissions over time */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-normal">Responses over time</CardTitle>
          <CardDescription>Submissions across all your forms, last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-2 sm:px-6">
          <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
            <AreaChart data={stats.submissionsByDay} margin={{ left: 4, right: 12 }}>
              <defs>
                <linearGradient id="fillResponses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={shortDate}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={28}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => shortDate(String(value))}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="count"
                type="monotone"
                fill="url(#fillResponses)"
                stroke="var(--color-count)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent forms */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-normal">Recent forms</CardTitle>
          <CardDescription>Your latest forms and their response counts</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentForms.length === 0 ? (
            <EmptyState
              bordered={false}
              icon={<IconClipboardText />}
              title="No forms yet"
              description="Create your first form to see it here."
            />
          ) : (
            <div className="flex flex-col divide-y">
              {stats.recentForms.map((form) => (
                <Link
                  key={form.id}
                  href={`/dashboard/forms/${form.id}`}
                  className="flex items-center justify-between gap-4 py-3 hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{form.title}</span>
                    <Badge variant={form.isPublished ? "default" : "secondary"}>
                      {form.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {form.responseCount} response{form.responseCount === 1 ? "" : "s"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
