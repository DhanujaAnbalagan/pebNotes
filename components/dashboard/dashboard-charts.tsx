"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardChartsProps {
  activity: any[];
  categories: any[];
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#ef4444', '#f97316'];

export function DashboardCharts({ activity, categories }: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-[400px] bg-accent/5 animate-pulse rounded-2xl border-none" />
        <Card className="h-[400px] bg-accent/5 animate-pulse rounded-2xl border-none" />
      </div>
    );
  }

  const hasActivity = activity && activity.length > 0;
  const hasCategories = categories && categories.length > 0;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Weekly Activity Chart */}
      <Card className="border-none bg-card/50 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Weekly Activity</CardTitle>
          <CardDescription>Notes created in the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasActivity ? (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activity}>
                  <defs>
                    <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.1} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#888888' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#888888' }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      borderRadius: '12px', 
                      border: '1px solid hsl(var(--border))',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="notes" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorNotes)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex flex-col items-center justify-center text-center gap-3 bg-accent/5 rounded-xl border border-dashed border-border/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-lg">📊</span>
              </div>
              <p className="text-sm text-muted-foreground">No activity data yet.<br/>Start creating notes to see your trends.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories Distribution */}
      <Card className="border-none bg-card/50 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Category Distribution</CardTitle>
          <CardDescription>Note distribution by your assigned categories.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasCategories ? (
            <div className="flex flex-col gap-4">
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {categories.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        borderRadius: '12px', 
                        border: '1px solid hsl(var(--border))',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((entry: any, index: number) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs font-medium">{entry.name}</span>
                    <span className="text-[10px] text-muted-foreground bg-accent/30 px-1.5 py-0.5 rounded-md">{entry.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[280px] flex flex-col items-center justify-center text-center gap-3 bg-accent/5 rounded-xl border border-dashed border-border/50">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <span className="text-purple-500 text-lg">🍩</span>
              </div>
              <p className="text-sm text-muted-foreground">No categories yet.<br/>Add categories to your notes to see distribution.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
