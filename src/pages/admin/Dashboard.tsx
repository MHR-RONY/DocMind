import {
  MessageSquare, Users, FileText, Activity, Brain, Loader2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { fetchAdminStats } from "@/lib/admin";
import { ApiRequestError } from "@/lib/api";

const CONVERSATION_DATA = [
  { date: "Mon", conversations: 420, resolved: 380 },
  { date: "Tue", conversations: 550, resolved: 510 },
  { date: "Wed", conversations: 480, resolved: 440 },
  { date: "Thu", conversations: 620, resolved: 580 },
  { date: "Fri", conversations: 710, resolved: 650 },
  { date: "Sat", conversations: 340, resolved: 310 },
  { date: "Sun", conversations: 290, resolved: 260 },
];

const TOPIC_DATA = [
  { name: "Product Info", value: 35 },
  { name: "Technical Support", value: 25 },
  { name: "Billing", value: 20 },
  { name: "General", value: 15 },
  { name: "Other", value: 5 },
];

const TOPIC_COLORS = [
  "hsl(24, 90%, 55%)",
  "hsl(210, 80%, 55%)",
  "hsl(142, 70%, 45%)",
  "hsl(280, 70%, 55%)",
  "hsl(45, 80%, 55%)",
];

const RECENT_CONVERSATIONS = [
  { user: "Sarah K.", query: "How do I reset my API key?", status: "resolved", time: "2 min ago", satisfaction: "positive" },
  { user: "James L.", query: "Integration with Slack not working", status: "escalated", time: "5 min ago", satisfaction: "negative" },
  { user: "Maria G.", query: "Pricing for enterprise plan", status: "resolved", time: "12 min ago", satisfaction: "positive" },
  { user: "Alex R.", query: "RAG pipeline latency issues", status: "in-progress", time: "18 min ago", satisfaction: "neutral" },
  { user: "Chen W.", query: "Document upload size limits", status: "resolved", time: "25 min ago", satisfaction: "positive" },
];

const PERFORMANCE_DATA = [
  { metric: "Accuracy", value: 94, change: "+2.1%" },
  { metric: "Relevance", value: 89, change: "+1.5%" },
  { metric: "Hallucination Rate", value: 3, change: "-0.8%" },
  { metric: "Fallback Rate", value: 7, change: "-1.2%" },
];

const statusColor: Record<string, string> = {
  resolved: "text-green-500 bg-green-500/10",
  escalated: "text-red-500 bg-red-500/10",
  "in-progress": "text-yellow-500 bg-yellow-500/10",
};

export default function Dashboard() {
  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: fetchAdminStats,
  });

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-green-500" },
    { label: "Documents Indexed", value: stats?.totalDocuments ?? 0, icon: FileText, color: "text-primary" },
    { label: "Total Messages", value: stats?.totalMessages ?? 0, icon: MessageSquare, color: "text-blue-500" },
    { label: "Tokens Used", value: (stats?.totalTokensUsed ?? 0).toLocaleString(), icon: Brain, color: "text-purple-500" },
  ];

  const statsErrorMessage =
    error instanceof ApiRequestError ? error.message : "Failed to load stats";

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold font-sans-body text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground font-sans-body mt-1">
          Overview of your AI RAG chatbot system
        </p>
      </div>

      {/* Stats Grid */}
      {isError ? (
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-destructive font-sans-body">{statsErrorMessage}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-semibold font-sans-body text-foreground">{stat.value}</p>
                )}
                <p className="text-xs text-muted-foreground font-sans-body mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Conversation Trends */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans-body">Conversation Trends</CardTitle>
            <CardDescription className="font-sans-body">Daily conversations this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CONVERSATION_DATA}>
                  <defs>
                    <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(24, 90%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(24, 90%, 55%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="conversations" stroke="hsl(24, 90%, 55%)" fill="url(#colorConv)" strokeWidth={2} />
                  <Area type="monotone" dataKey="resolved" stroke="hsl(142, 70%, 45%)" fill="url(#colorRes)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Topics Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans-body">Topic Distribution</CardTitle>
            <CardDescription className="font-sans-body">Query categories breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={TOPIC_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {TOPIC_DATA.map((_, i) => (
                      <Cell key={i} fill={TOPIC_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {TOPIC_DATA.map((t, i) => (
                <div key={t.name} className="flex items-center gap-2 text-xs font-sans-body">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: TOPIC_COLORS[i] }} />
                  <span className="text-muted-foreground">{t.name}</span>
                  <span className="text-foreground font-medium ml-auto">{t.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Conversations */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans-body">Recent Conversations</CardTitle>
            <CardDescription className="font-sans-body">Latest chatbot interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_CONVERSATIONS.map((conv, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                    {conv.user.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-sans-body text-foreground font-medium">{conv.user}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans-body ${statusColor[conv.status]}`}>
                        {conv.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-sans-body truncate">{conv.query}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-sans-body whitespace-nowrap">{conv.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RAG Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans-body flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              RAG Performance
            </CardTitle>
            <CardDescription className="font-sans-body">Model quality metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {PERFORMANCE_DATA.map((perf) => (
                <div key={perf.metric}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-sans-body text-foreground">{perf.metric}</span>
                    <span className="text-xs font-sans-body text-green-500">{perf.change}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${perf.value}%` }}
                    />
                  </div>
                  <p className="text-right text-xs text-muted-foreground font-sans-body mt-1">{perf.value}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
