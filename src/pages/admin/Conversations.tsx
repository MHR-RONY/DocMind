import { useState } from "react";
import { Search, Filter, MoreHorizontal, MessageSquare, Clock, CheckCircle2, AlertTriangle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CONVERSATIONS = [
  { id: "C-1001", user: "Sarah Kim", email: "sarah@example.com", query: "How do I reset my API key?", status: "resolved", sentiment: "positive", messages: 6, duration: "3m 12s", time: "2 min ago", source: "Web" },
  { id: "C-1002", user: "James Lee", email: "james@example.com", query: "Integration with Slack not working after update", status: "escalated", sentiment: "negative", messages: 12, duration: "8m 45s", time: "5 min ago", source: "API" },
  { id: "C-1003", user: "Maria Garcia", email: "maria@example.com", query: "Pricing for enterprise plan details", status: "resolved", sentiment: "positive", messages: 4, duration: "2m 30s", time: "12 min ago", source: "Web" },
  { id: "C-1004", user: "Alex Russo", email: "alex@example.com", query: "RAG pipeline latency issues on production", status: "in-progress", sentiment: "neutral", messages: 8, duration: "5m 20s", time: "18 min ago", source: "Web" },
  { id: "C-1005", user: "Chen Wei", email: "chen@example.com", query: "Document upload size limits for PDFs", status: "resolved", sentiment: "positive", messages: 3, duration: "1m 45s", time: "25 min ago", source: "Mobile" },
  { id: "C-1006", user: "Emma Wilson", email: "emma@example.com", query: "How to configure custom embeddings model", status: "resolved", sentiment: "positive", messages: 7, duration: "4m 10s", time: "32 min ago", source: "Web" },
  { id: "C-1007", user: "Raj Patel", email: "raj@example.com", query: "Authentication error when accessing knowledge base", status: "escalated", sentiment: "negative", messages: 15, duration: "12m 05s", time: "45 min ago", source: "API" },
  { id: "C-1008", user: "Lisa Chen", email: "lisa@example.com", query: "Best practices for chunking documents", status: "resolved", sentiment: "positive", messages: 5, duration: "3m 00s", time: "1h ago", source: "Web" },
  { id: "C-1009", user: "Tom Brown", email: "tom@example.com", query: "Webhook delivery failures", status: "in-progress", sentiment: "neutral", messages: 9, duration: "6m 30s", time: "1h ago", source: "API" },
  { id: "C-1010", user: "Ana Silva", email: "ana@example.com", query: "Multi-language support for chatbot", status: "closed", sentiment: "positive", messages: 4, duration: "2m 15s", time: "2h ago", source: "Web" },
];

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  resolved: { label: "Resolved", class: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
  escalated: { label: "Escalated", class: "bg-red-500/10 text-red-500 border-red-500/20", icon: AlertTriangle },
  "in-progress": { label: "In Progress", class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock },
  closed: { label: "Closed", class: "bg-muted text-muted-foreground border-border", icon: XCircle },
};

const SENTIMENT_DOT: Record<string, string> = {
  positive: "bg-green-500",
  negative: "bg-red-500",
  neutral: "bg-yellow-500",
};

const STAT_CARDS = [
  { label: "Total", value: "12,847", icon: MessageSquare },
  { label: "Resolved", value: "11,203", icon: CheckCircle2 },
  { label: "Escalated", value: "342", icon: AlertTriangle },
  { label: "Avg Duration", value: "4m 12s", icon: Clock },
];

export default function Conversations() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = CONVERSATIONS.filter((c) => {
    const matchSearch = !search || c.user.toLowerCase().includes(search.toLowerCase()) || c.query.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "all" || c.status === activeTab;
    return matchSearch && matchTab;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold font-sans-body text-foreground">Conversations</h1>
        <p className="text-sm text-muted-foreground font-sans-body mt-1">Monitor and manage chatbot conversations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary text-primary">
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-semibold font-sans-body text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground font-sans-body">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="in-progress" className="text-xs">In Progress</TabsTrigger>
                <TabsTrigger value="resolved" className="text-xs">Resolved</TabsTrigger>
                <TabsTrigger value="escalated" className="text-xs">Escalated</TabsTrigger>
                <TabsTrigger value="closed" className="text-xs">Closed</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 w-[220px] text-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="h-3.5 w-3.5" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-sans-body">ID</TableHead>
                <TableHead className="text-xs font-sans-body">User</TableHead>
                <TableHead className="text-xs font-sans-body">Query</TableHead>
                <TableHead className="text-xs font-sans-body">Status</TableHead>
                <TableHead className="text-xs font-sans-body">Sentiment</TableHead>
                <TableHead className="text-xs font-sans-body text-center">Messages</TableHead>
                <TableHead className="text-xs font-sans-body">Duration</TableHead>
                <TableHead className="text-xs font-sans-body">Source</TableHead>
                <TableHead className="text-xs font-sans-body">Time</TableHead>
                <TableHead className="text-xs font-sans-body w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((conv) => {
                const st = STATUS_CONFIG[conv.status];
                return (
                  <TableRow key={conv.id} className="cursor-pointer">
                    <TableCell className="text-xs font-mono text-muted-foreground">{conv.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-semibold shrink-0">
                          {conv.user.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-sans-body text-foreground">{conv.user}</p>
                          <p className="text-[10px] text-muted-foreground">{conv.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <p className="text-sm font-sans-body text-foreground truncate">{conv.query}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] gap-1 ${st.class}`}>
                        <st.icon className="h-3 w-3" />
                        {st.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${SENTIMENT_DOT[conv.sentiment]}`} />
                        <span className="text-xs text-muted-foreground capitalize">{conv.sentiment}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">{conv.messages}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{conv.duration}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">{conv.source}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{conv.time}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-sm text-muted-foreground">
                    No conversations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground font-sans-body">Showing {filtered.length} of 12,847 conversations</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" className="h-7 min-w-7 text-xs">1</Button>
              <Button variant="ghost" size="sm" className="h-7 min-w-7 text-xs">2</Button>
              <Button variant="ghost" size="sm" className="h-7 min-w-7 text-xs">3</Button>
              <Button variant="outline" size="icon" className="h-7 w-7"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
