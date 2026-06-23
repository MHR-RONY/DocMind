import { useState } from "react";
import { Brain, Cpu, Activity, Zap, BarChart3, RefreshCw, Settings, Play, Pause } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const MODELS = [
  { id: 1, name: "text-embedding-3-small", provider: "OpenAI", dimensions: 1536, status: "active", vectors: 13072, avgLatency: "45ms", cost: "$0.002/1K tokens", default: true },
  { id: 2, name: "text-embedding-3-large", provider: "OpenAI", dimensions: 3072, status: "active", vectors: 4521, avgLatency: "78ms", cost: "$0.013/1K tokens", default: false },
  { id: 3, name: "embed-english-v3.0", provider: "Cohere", dimensions: 1024, status: "inactive", vectors: 0, avgLatency: "—", cost: "$0.001/1K tokens", default: false },
  { id: 4, name: "bge-large-en-v1.5", provider: "Local", dimensions: 1024, status: "active", vectors: 8934, avgLatency: "12ms", cost: "Free (self-hosted)", default: false },
];

const USAGE_DATA = [
  { date: "Mar 1", requests: 1200, tokens: 45000 },
  { date: "Mar 5", requests: 1800, tokens: 67000 },
  { date: "Mar 10", requests: 2400, tokens: 89000 },
  { date: "Mar 15", requests: 1900, tokens: 72000 },
  { date: "Mar 20", requests: 3100, tokens: 115000 },
  { date: "Mar 25", requests: 2800, tokens: 104000 },
  { date: "Apr 1", requests: 3500, tokens: 128000 },
  { date: "Apr 5", requests: 3200, tokens: 118000 },
];

const COLLECTIONS = [
  { name: "product_docs", model: "text-embedding-3-small", vectors: 5234, dimensions: 1536, size: "234 MB", similarity: "cosine", lastUpdated: "2 hours ago" },
  { name: "support_tickets", model: "text-embedding-3-small", vectors: 4521, dimensions: 1536, size: "189 MB", similarity: "cosine", lastUpdated: "30 min ago" },
  { name: "knowledge_base", model: "bge-large-en-v1.5", vectors: 3317, dimensions: 1024, size: "156 MB", similarity: "dot_product", lastUpdated: "1 day ago" },
  { name: "faq_embeddings", model: "text-embedding-3-large", vectors: 891, dimensions: 3072, size: "98 MB", similarity: "cosine", lastUpdated: "3 hours ago" },
];

const statusColor: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  inactive: "bg-muted text-muted-foreground border-border",
};

export default function Embeddings() {
  const totalVectors = MODELS.reduce((a, m) => a + m.vectors, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-sans-body text-foreground">Embeddings</h1>
          <p className="text-sm text-muted-foreground font-sans-body mt-1">Manage embedding models, vector collections, and usage</p>
        </div>
        <Button className="gap-2"><Brain className="h-4 w-4" /> Add Model</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Vectors", value: totalVectors.toLocaleString(), icon: Brain, sub: "Across all collections" },
          { label: "Active Models", value: MODELS.filter(m => m.status === "active").length, icon: Cpu, sub: `${MODELS.length} configured` },
          { label: "Avg Latency", value: "38ms", icon: Activity, sub: "P95: 89ms" },
          { label: "Monthly Cost", value: "$42.30", icon: Zap, sub: "↓ 12% from last month" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-sans-body">{stat.label}</p>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="collections">Vector Collections</TabsTrigger>
          <TabsTrigger value="usage">Usage & Cost</TabsTrigger>
        </TabsList>

        <TabsContent value="models">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-sans-body">Embedding Models</CardTitle>
              <CardDescription className="text-xs">Configure and manage embedding model providers</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Dimensions</TableHead>
                    <TableHead>Vectors</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MODELS.map(model => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium text-sm">
                        <div className="flex items-center gap-2">
                          {model.name}
                          {model.default && <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20" variant="outline">Default</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{model.provider}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{model.dimensions.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{model.vectors.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{model.avgLatency}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{model.cost}</TableCell>
                      <TableCell><Badge variant="outline" className={statusColor[model.status]}>{model.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            {model.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Settings className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-sans-body">Vector Collections</CardTitle>
              <CardDescription className="text-xs">Vector database collections and their configuration</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Collection</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Vectors</TableHead>
                    <TableHead>Dimensions</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Similarity</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COLLECTIONS.map(col => (
                    <TableRow key={col.name}>
                      <TableCell className="font-mono text-sm font-medium">{col.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{col.model}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{col.vectors.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{col.dimensions}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{col.size}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[11px]">{col.similarity}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{col.lastUpdated}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" className="h-7 w-7"><RefreshCw className="h-3.5 w-3.5" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-sans-body">Embedding Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={USAGE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-[11px] fill-muted-foreground" tick={{ fontSize: 11 }} />
                      <YAxis className="text-[11px] fill-muted-foreground" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="requests" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-sans-body">Token Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={USAGE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-[11px] fill-muted-foreground" tick={{ fontSize: 11 }} />
                      <YAxis className="text-[11px] fill-muted-foreground" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="tokens" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
