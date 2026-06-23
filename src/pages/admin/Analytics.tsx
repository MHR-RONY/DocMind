import {
  TrendingUp, TrendingDown, Users, MessageSquare, Clock, Target,
  ArrowUpRight, Globe, Smartphone, Monitor, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const STATS = [
  { label: "Total Queries", value: "48,293", change: "+12.4%", up: true, icon: MessageSquare },
  { label: "Unique Users", value: "8,124", change: "+9.7%", up: true, icon: Users },
  { label: "Resolution Rate", value: "87.3%", change: "+2.1%", up: true, icon: Target },
  { label: "Avg Response", value: "1.2s", change: "-0.3s", up: true, icon: Clock },
];

const DAILY_DATA = [
  { date: "Jan 1", queries: 1200, resolved: 1050, users: 340 },
  { date: "Jan 5", queries: 1450, resolved: 1280, users: 410 },
  { date: "Jan 10", queries: 1100, resolved: 980, users: 290 },
  { date: "Jan 15", queries: 1680, resolved: 1520, users: 480 },
  { date: "Jan 20", queries: 1900, resolved: 1750, users: 520 },
  { date: "Jan 25", queries: 1550, resolved: 1400, users: 430 },
  { date: "Jan 30", queries: 2100, resolved: 1950, users: 580 },
];

const HOURLY_DATA = [
  { hour: "00", queries: 120 }, { hour: "02", queries: 80 }, { hour: "04", queries: 45 },
  { hour: "06", queries: 90 }, { hour: "08", queries: 320 }, { hour: "10", queries: 580 },
  { hour: "12", queries: 650 }, { hour: "14", queries: 720 }, { hour: "16", queries: 680 },
  { hour: "18", queries: 510 }, { hour: "20", queries: 380 }, { hour: "22", queries: 200 },
];

const SOURCE_DATA = [
  { name: "Web Widget", value: 45 },
  { name: "API", value: 28 },
  { name: "Mobile App", value: 18 },
  { name: "Slack", value: 9 },
];

const SOURCE_COLORS = ["hsl(24, 90%, 55%)", "hsl(210, 80%, 55%)", "hsl(142, 70%, 45%)", "hsl(280, 70%, 55%)"];

const SATISFACTION_DATA = [
  { date: "Week 1", positive: 78, neutral: 15, negative: 7 },
  { date: "Week 2", positive: 80, neutral: 13, negative: 7 },
  { date: "Week 3", positive: 82, neutral: 12, negative: 6 },
  { date: "Week 4", positive: 85, neutral: 10, negative: 5 },
];

const TOP_QUERIES = [
  { query: "How to reset API key", count: 342, trend: "+12%" },
  { query: "Pricing plans comparison", count: 298, trend: "+8%" },
  { query: "Integration setup guide", count: 267, trend: "+15%" },
  { query: "Document upload limits", count: 234, trend: "-3%" },
  { query: "Custom embeddings config", count: 198, trend: "+22%" },
  { query: "Authentication errors", count: 176, trend: "+5%" },
  { query: "Webhook configuration", count: 154, trend: "-1%" },
];

const RESPONSE_QUALITY = [
  { metric: "Accuracy", value: 94.2, prev: 92.1 },
  { metric: "Relevance", value: 89.5, prev: 88.0 },
  { metric: "Completeness", value: 86.3, prev: 84.7 },
  { metric: "Hallucination", value: 2.8, prev: 3.6 },
];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

export default function Analytics() {
  const [period, setPeriod] = useState("30d");

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-sans-body text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground font-sans-body mt-1">Performance metrics and usage insights</p>
        </div>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList>
            <TabsTrigger value="7d" className="text-xs">7D</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs">30D</TabsTrigger>
            <TabsTrigger value="90d" className="text-xs">90D</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-secondary text-primary">
                  <stat.icon className="h-4 w-4" />
                </div>
                <span className={`text-xs font-sans-body flex items-center gap-0.5 ${stat.up ? "text-green-500" : "text-red-500"}`}>
                  {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-semibold font-sans-body text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-sans-body mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Query Volume */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans-body">Query Volume</CardTitle>
            <CardDescription className="font-sans-body">Total queries and resolved over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DAILY_DATA}>
                  <defs>
                    <linearGradient id="aQueries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(24, 90%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(24, 90%, 55%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="queries" stroke="hsl(24, 90%, 55%)" fill="url(#aQueries)" strokeWidth={2} />
                  <Area type="monotone" dataKey="resolved" stroke="hsl(142, 70%, 45%)" fill="url(#aResolved)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans-body">Traffic Sources</CardTitle>
            <CardDescription className="font-sans-body">Where queries come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={SOURCE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {SOURCE_DATA.map((_, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {SOURCE_DATA.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between text-xs font-sans-body">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: SOURCE_COLORS[i] }} />
                    <span className="text-muted-foreground">{s.name}</span>
                  </div>
                  <span className="text-foreground font-medium">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Peak Hours */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans-body flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Peak Hours
            </CardTitle>
            <CardDescription className="font-sans-body">Query distribution by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={HOURLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="queries" fill="hsl(24, 90%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Satisfaction */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans-body">User Satisfaction</CardTitle>
            <CardDescription className="font-sans-body">Weekly satisfaction trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SATISFACTION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="positive" stroke="hsl(142, 70%, 45%)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="neutral" stroke="hsl(45, 80%, 55%)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="negative" stroke="hsl(0, 70%, 55%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Queries */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans-body">Top Queries</CardTitle>
            <CardDescription className="font-sans-body">Most frequently asked questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {TOP_QUERIES.map((q, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50">
                  <span className="text-xs font-mono text-muted-foreground w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans-body text-foreground truncate">{q.query}</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-sans-body">{q.count} queries</span>
                  <span className={`text-xs font-sans-body ${q.trend.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                    {q.trend}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Response Quality */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans-body">Response Quality</CardTitle>
            <CardDescription className="font-sans-body">AI model performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {RESPONSE_QUALITY.map((m) => {
                const improved = m.metric === "Hallucination" ? m.value < m.prev : m.value > m.prev;
                const diff = Math.abs(m.value - m.prev).toFixed(1);
                return (
                  <div key={m.metric}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-sans-body text-foreground">{m.metric}</span>
                      <span className={`text-xs font-sans-body flex items-center gap-0.5 ${improved ? "text-green-500" : "text-red-500"}`}>
                        {improved ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {diff}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${m.metric === "Hallucination" ? 100 - m.value : m.value}%` }}
                      />
                    </div>
                    <p className="text-right text-xs text-muted-foreground font-sans-body mt-1">{m.value}%</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
