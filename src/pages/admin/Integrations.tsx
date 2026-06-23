import { useState } from "react";
import {
  Plug, Key, Globe, MessageSquare, Mail, Webhook, Copy, Eye, EyeOff,
  RefreshCw, Plus, CheckCircle2, XCircle, ExternalLink, Shield,
  Activity, Clock, Zap, Settings, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const API_KEYS = [
  { id: "1", name: "Production API Key", key: "sk-prod-a8f3d2e1b7c9f4a6d8e2b1c7", created: "Jan 15, 2025", lastUsed: "2 hours ago", requests: "12,847", status: "active" as const, rateLimit: "1000/min" },
  { id: "2", name: "Development Key", key: "sk-dev-c4b2a9e7d1f8c3b5a7d9e1f2", created: "Feb 20, 2025", lastUsed: "5 mins ago", requests: "3,291", status: "active" as const, rateLimit: "100/min" },
  { id: "3", name: "Staging Key", key: "sk-stg-e7f1b3c9d2a8f4e6b1c7d3a9", created: "Mar 10, 2025", lastUsed: "12 hours ago", requests: "892", status: "active" as const, rateLimit: "500/min" },
  { id: "4", name: "Legacy Key (v1)", key: "sk-legacy-b9d1c7e3f2a8d4b6c1e9f7a3", created: "Jun 1, 2024", lastUsed: "30 days ago", requests: "0", status: "revoked" as const, rateLimit: "—" },
];

const INTEGRATIONS = [
  { id: "1", name: "Slack", icon: MessageSquare, description: "Send bot responses, alerts, and conversation summaries to Slack channels.", connected: true, color: "text-purple-500", events: "message.created, conversation.ended", lastSync: "2 mins ago" },
  { id: "2", name: "Webhook", icon: Webhook, description: "Forward real-time events to external endpoints via configurable HTTP webhooks.", connected: true, color: "text-blue-500", events: "All events", lastSync: "10 mins ago" },
  { id: "3", name: "Email (SMTP)", icon: Mail, description: "Send email notifications, conversation transcripts, and weekly digest reports.", connected: false, color: "text-orange-500", events: "—", lastSync: "—" },
  { id: "4", name: "Custom REST API", icon: Globe, description: "Connect to any REST API as a data source, enrichment layer, or action endpoint.", connected: false, color: "text-emerald-500", events: "—", lastSync: "—" },
  { id: "5", name: "Zapier", icon: Zap, description: "Automate workflows by connecting to 5000+ apps through Zapier triggers and actions.", connected: true, color: "text-orange-400", events: "conversation.ended", lastSync: "1 hour ago" },
  { id: "6", name: "Analytics", icon: Activity, description: "Push conversation metrics and usage data to your analytics platform.", connected: false, color: "text-cyan-500", events: "—", lastSync: "—" },
];

const WEBHOOKS = [
  { id: "1", url: "https://hooks.example.com/chat-events", events: ["message.created", "conversation.ended"], status: "active" as const, lastTriggered: "10 mins ago", successRate: 99.8, totalCalls: 4521 },
  { id: "2", url: "https://api.analytics.io/ingest", events: ["analytics.daily", "analytics.weekly"], status: "active" as const, lastTriggered: "1 day ago", successRate: 100, totalCalls: 312 },
  { id: "3", url: "https://crm.company.com/webhook/rag", events: ["conversation.ended", "feedback.submitted"], status: "active" as const, lastTriggered: "3 hours ago", successRate: 97.2, totalCalls: 1893 },
  { id: "4", url: "https://old-service.test/hook", events: ["message.created"], status: "failing" as const, lastTriggered: "3 days ago", successRate: 12.5, totalCalls: 48 },
];

const STATS = [
  { label: "Active Keys", value: "3", icon: Key, sub: "1 revoked" },
  { label: "Connected Apps", value: "3", icon: Plug, sub: "of 6 available" },
  { label: "Webhook Calls (24h)", value: "1,247", icon: Webhook, sub: "99.1% success" },
  { label: "API Requests (24h)", value: "8,432", icon: Activity, sub: "+12% vs yesterday" },
];

export default function Integrations() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleKey = (id: string) => setShowKeys((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-sans-body">API & Integrations</h1>
        <p className="text-sm text-muted-foreground font-sans-body mt-1">
          Manage API keys, connect third-party services, and configure webhook endpoints.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-sans-body">{s.label}</p>
                  <p className="text-xl font-bold font-sans-body">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground font-sans-body">{s.sub}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keys" className="font-sans-body text-xs">API Keys</TabsTrigger>
          <TabsTrigger value="integrations" className="font-sans-body text-xs">Integrations</TabsTrigger>
          <TabsTrigger value="webhooks" className="font-sans-body text-xs">Webhooks</TabsTrigger>
        </TabsList>

        {/* API Keys */}
        <TabsContent value="keys" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-sans-body">Generate and manage API keys for programmatic access to your RAG system.</p>
            <Button size="sm" className="gap-2 font-sans-body"><Plus className="h-4 w-4" />Generate Key</Button>
          </div>
          <div className="space-y-3">
            {API_KEYS.map((k) => (
              <Card key={k.id} className={k.status === "revoked" ? "opacity-60" : ""}>
                <CardContent className="flex items-start gap-4 py-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium font-sans-body">{k.name}</p>
                      <Badge variant="outline" className={k.status === "active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
                        {k.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {showKeys[k.id] ? k.key : k.key.slice(0, 7) + "••••••••••••••••••"}
                      </code>
                      <button onClick={() => toggleKey(k.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                        {showKeys[k.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button className="text-muted-foreground hover:text-foreground transition-colors"><Copy className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-sans-body flex-wrap">
                      <span>Created {k.created}</span>
                      <span>Last used {k.lastUsed}</span>
                      <span>{k.requests} requests</span>
                      <span>Rate limit: {k.rateLimit}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {k.status === "active" && (
                      <>
                        <Button variant="ghost" size="sm" className="text-xs font-sans-body gap-1"><Settings className="h-3.5 w-3.5" />Configure</Button>
                        <Button variant="outline" size="sm" className="text-xs font-sans-body text-destructive hover:text-destructive">Revoke</Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Usage note */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-3 py-4">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium font-sans-body">API Key Security</p>
                <p className="text-xs text-muted-foreground font-sans-body leading-relaxed">
                  Never share your API keys publicly or commit them to version control. Use environment variables to store keys securely. Rotate keys regularly and revoke unused ones.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-4">
          <p className="text-sm text-muted-foreground font-sans-body">Connect your RAG chatbot to third-party services for notifications, automation, and data enrichment.</p>
          <div className="grid gap-4 md:grid-cols-2">
            {INTEGRATIONS.map((i) => (
              <Card key={i.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-start gap-4 py-5">
                  <div className="h-11 w-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
                    <i.icon className={`h-5 w-5 ${i.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium font-sans-body">{i.name}</p>
                      <Switch checked={i.connected} />
                    </div>
                    <p className="text-xs text-muted-foreground font-sans-body leading-relaxed">{i.description}</p>
                    {i.connected ? (
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] gap-1">
                          <CheckCircle2 className="h-3 w-3" />Connected
                        </Badge>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-sans-body">
                          <span>Synced {i.lastSync}</span>
                          <button className="text-primary hover:underline flex items-center gap-0.5">
                            Configure <ExternalLink className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="text-xs font-sans-body gap-1 h-7">
                        <Plus className="h-3 w-3" />Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-sans-body">Configure HTTP endpoints to receive real-time event notifications from your RAG system.</p>
            <Button size="sm" className="gap-2 font-sans-body"><Plus className="h-4 w-4" />Add Webhook</Button>
          </div>
          <div className="space-y-3">
            {WEBHOOKS.map((w) => (
              <Card key={w.id} className={w.status === "failing" ? "border-destructive/30" : ""}>
                <CardContent className="py-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${w.status === "active" ? "bg-emerald-500" : "bg-destructive animate-pulse"}`} />
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono truncate">{w.url}</code>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {w.status === "active" ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
                          <AlertTriangle className="h-3 w-3" />Failing
                        </Badge>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8"><RefreshCw className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {w.events.map((e) => (
                      <Badge key={e} variant="secondary" className="text-[10px] font-mono">{e}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-sans-body">
                    <div className="flex items-center gap-4">
                      <span>Last triggered {w.lastTriggered}</span>
                      <span>{w.totalCalls.toLocaleString()} total calls</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Success rate:</span>
                      <span className={w.successRate > 95 ? "text-emerald-500 font-medium" : "text-destructive font-medium"}>
                        {w.successRate}%
                      </span>
                      <Progress value={w.successRate} className="h-1.5 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
