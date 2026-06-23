import { useState } from "react";
import { Database, Globe, FileText, Cloud, Plus, RefreshCw, Settings, Trash2, CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

const DATA_SOURCES = [
  { id: 1, name: "Company Website", type: "Web Crawler", icon: Globe, url: "https://docs.example.com", status: "connected", lastSync: "2 hours ago", docs: 234, chunks: 1892, schedule: "Every 6 hours", enabled: true },
  { id: 2, name: "PostgreSQL - Production", type: "Database", icon: Database, url: "postgresql://prod-db:5432", status: "connected", lastSync: "30 min ago", docs: 1456, chunks: 8234, schedule: "Every hour", enabled: true },
  { id: 3, name: "Confluence Wiki", type: "API", icon: Cloud, url: "https://company.atlassian.net", status: "syncing", lastSync: "Syncing now...", docs: 89, chunks: 567, schedule: "Every 12 hours", enabled: true },
  { id: 4, name: "Google Drive", type: "Cloud Storage", icon: Cloud, url: "drive.google.com/shared", status: "connected", lastSync: "1 day ago", docs: 312, chunks: 2145, schedule: "Daily", enabled: true },
  { id: 5, name: "Notion Workspace", type: "API", icon: FileText, url: "https://notion.so/workspace", status: "error", lastSync: "Failed 3 hours ago", docs: 45, chunks: 234, schedule: "Every 6 hours", enabled: false },
  { id: 6, name: "S3 Bucket - Docs", type: "Cloud Storage", icon: Cloud, url: "s3://company-docs-bucket", status: "disconnected", lastSync: "Never", docs: 0, chunks: 0, schedule: "Manual", enabled: false },
];

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  connected: { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  syncing: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> },
  error: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  disconnected: { color: "bg-muted text-muted-foreground border-border", icon: <Clock className="h-3.5 w-3.5" /> },
};

export default function DataSources() {
  const [search, setSearch] = useState("");
  const filtered = DATA_SOURCES.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const connectedCount = DATA_SOURCES.filter(s => s.status === "connected" || s.status === "syncing").length;
  const totalDocs = DATA_SOURCES.reduce((a, s) => a + s.docs, 0);
  const totalChunks = DATA_SOURCES.reduce((a, s) => a + s.chunks, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-sans-body text-foreground">Data Sources</h1>
          <p className="text-sm text-muted-foreground font-sans-body mt-1">Connect and manage external data sources for ingestion</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Source</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Sources", value: DATA_SOURCES.length, sub: `${connectedCount} active` },
          { label: "Documents Ingested", value: totalDocs.toLocaleString(), sub: "From all sources" },
          { label: "Total Chunks", value: totalChunks.toLocaleString(), sub: "Generated" },
          { label: "Errors", value: DATA_SOURCES.filter(s => s.status === "error").length, sub: "Need attention" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-sans-body">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input placeholder="Search data sources..." className="max-w-sm h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(source => {
          const sc = statusConfig[source.status];
          return (
            <Card key={source.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <source.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-sans-body">{source.name}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">{source.type} · {source.url}</CardDescription>
                    </div>
                  </div>
                  <Switch checked={source.enabled} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline" className={`gap-1 ${sc.color}`}>{sc.icon} {source.status}</Badge>
                  <span className="text-muted-foreground">{source.lastSync}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div><p className="text-lg font-bold text-foreground">{source.docs}</p><p className="text-[10px] text-muted-foreground">Documents</p></div>
                  <div><p className="text-lg font-bold text-foreground">{source.chunks.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Chunks</p></div>
                  <div><p className="text-xs font-medium text-foreground mt-1">{source.schedule}</p><p className="text-[10px] text-muted-foreground">Sync Schedule</p></div>
                </div>
                {source.status === "syncing" && <Progress value={62} className="h-1.5" />}
                <div className="flex items-center gap-2 pt-1">
                  <Button variant="outline" size="sm" className="gap-1.5 flex-1 text-xs"><RefreshCw className="h-3 w-3" /> Sync Now</Button>
                  <Button variant="outline" size="sm" className="gap-1.5 flex-1 text-xs"><Settings className="h-3 w-3" /> Configure</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
