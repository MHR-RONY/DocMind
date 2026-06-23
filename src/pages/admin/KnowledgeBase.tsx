import { useState } from "react";
import {
  BookOpen, FileText, Search, Plus, MoreHorizontal, RefreshCw,
  CheckCircle2, Clock, AlertTriangle, XCircle, Filter, Download,
  Trash2, Eye, ChevronLeft, ChevronRight, Database, Zap, HardDrive
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const STATS = [
  { label: "Total Documents", value: "1,892", icon: FileText, desc: "Across 24 collections" },
  { label: "Indexed Chunks", value: "47,230", icon: Database, desc: "Avg 25 chunks/doc" },
  { label: "Storage Used", value: "3.8 GB", icon: HardDrive, desc: "of 10 GB limit" },
  { label: "Last Sync", value: "12 min ago", icon: RefreshCw, desc: "Auto-sync enabled" },
];

const COLLECTIONS = [
  { name: "Product Documentation", docs: 342, chunks: 8550, size: "820 MB", updated: "2 hours ago", status: "synced" },
  { name: "API Reference", docs: 156, chunks: 5200, size: "340 MB", updated: "1 hour ago", status: "synced" },
  { name: "Support Articles", docs: 489, chunks: 12250, size: "1.1 GB", updated: "30 min ago", status: "syncing" },
  { name: "Internal Wiki", docs: 278, chunks: 6950, size: "560 MB", updated: "4 hours ago", status: "synced" },
  { name: "Release Notes", docs: 127, chunks: 3175, size: "210 MB", updated: "1 day ago", status: "synced" },
  { name: "Training Materials", docs: 94, chunks: 2820, size: "380 MB", updated: "3 days ago", status: "stale" },
  { name: "Legal & Compliance", docs: 63, chunks: 1890, size: "150 MB", updated: "1 week ago", status: "error" },
  { name: "Customer Feedback", docs: 343, chunks: 6395, size: "240 MB", updated: "5 hours ago", status: "synced" },
];

const DOCUMENTS = [
  { id: "DOC-001", title: "Getting Started Guide", collection: "Product Documentation", chunks: 32, size: "2.4 MB", type: "PDF", status: "indexed", updated: "2h ago" },
  { id: "DOC-002", title: "REST API v2 Reference", collection: "API Reference", chunks: 85, size: "5.1 MB", type: "MD", status: "indexed", updated: "1h ago" },
  { id: "DOC-003", title: "Troubleshooting Common Errors", collection: "Support Articles", chunks: 18, size: "890 KB", type: "HTML", status: "processing", updated: "10m ago" },
  { id: "DOC-004", title: "Data Privacy Policy 2024", collection: "Legal & Compliance", chunks: 12, size: "340 KB", type: "PDF", status: "error", updated: "1w ago" },
  { id: "DOC-005", title: "Webhook Integration Guide", collection: "API Reference", chunks: 24, size: "1.8 MB", type: "MD", status: "indexed", updated: "3h ago" },
  { id: "DOC-006", title: "Q4 Release Notes", collection: "Release Notes", chunks: 15, size: "620 KB", type: "MD", status: "indexed", updated: "1d ago" },
  { id: "DOC-007", title: "Onboarding Checklist", collection: "Training Materials", chunks: 8, size: "210 KB", type: "DOCX", status: "stale", updated: "3d ago" },
  { id: "DOC-008", title: "Enterprise SSO Setup", collection: "Product Documentation", chunks: 21, size: "1.2 MB", type: "PDF", status: "indexed", updated: "5h ago" },
];

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  indexed: { label: "Indexed", class: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
  synced: { label: "Synced", class: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
  processing: { label: "Processing", class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock },
  syncing: { label: "Syncing", class: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: RefreshCw },
  error: { label: "Error", class: "bg-red-500/10 text-red-500 border-red-500/20", icon: AlertTriangle },
  stale: { label: "Stale", class: "bg-muted text-muted-foreground border-border", icon: XCircle },
};

const TYPE_COLOR: Record<string, string> = {
  PDF: "bg-red-500/10 text-red-500",
  MD: "bg-blue-500/10 text-blue-500",
  HTML: "bg-orange-500/10 text-orange-500",
  DOCX: "bg-purple-500/10 text-purple-500",
};

export default function KnowledgeBase() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"collections" | "documents">("collections");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCollections = COLLECTIONS.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredDocs = DOCUMENTS.filter((d) => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.collection.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-sans-body text-foreground">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground font-sans-body mt-1">Manage documents, collections, and embeddings for your RAG system</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Re-index All
          </Button>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Document
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary text-primary">
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-semibold font-sans-body text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground font-sans-body">{s.label}</p>
                <p className="text-[10px] text-muted-foreground/70 font-sans-body">{s.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Indexing Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-sans-body text-foreground font-medium">Indexing Pipeline</span>
            </div>
            <span className="text-xs text-muted-foreground font-sans-body">3 documents in queue</span>
          </div>
          <Progress value={78} className="h-2" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-muted-foreground font-sans-body">Processing: Troubleshooting Common Errors</span>
            <span className="text-[11px] text-muted-foreground font-sans-body">78% complete</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <Tabs value={view} onValueChange={(v) => { setView(v as "collections" | "documents"); setStatusFilter("all"); setSearch(""); }}>
              <TabsList>
                <TabsTrigger value="collections" className="text-xs gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> Collections
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-xs gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Documents
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={view === "collections" ? "Search collections..." : "Search documents..."}
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
          {view === "collections" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-sans-body">Collection</TableHead>
                  <TableHead className="text-xs font-sans-body text-center">Documents</TableHead>
                  <TableHead className="text-xs font-sans-body text-center">Chunks</TableHead>
                  <TableHead className="text-xs font-sans-body">Size</TableHead>
                  <TableHead className="text-xs font-sans-body">Status</TableHead>
                  <TableHead className="text-xs font-sans-body">Last Updated</TableHead>
                  <TableHead className="text-xs font-sans-body w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollections.map((col) => {
                  const st = STATUS_CONFIG[col.status];
                  return (
                    <TableRow key={col.name} className="cursor-pointer">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-sans-body text-foreground font-medium">{col.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">{col.docs}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">{col.chunks.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{col.size}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] gap-1 ${st.class}`}>
                          <st.icon className="h-3 w-3" />
                          {st.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{col.updated}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-sans-body">ID</TableHead>
                  <TableHead className="text-xs font-sans-body">Document</TableHead>
                  <TableHead className="text-xs font-sans-body">Collection</TableHead>
                  <TableHead className="text-xs font-sans-body">Type</TableHead>
                  <TableHead className="text-xs font-sans-body text-center">Chunks</TableHead>
                  <TableHead className="text-xs font-sans-body">Size</TableHead>
                  <TableHead className="text-xs font-sans-body">Status</TableHead>
                  <TableHead className="text-xs font-sans-body">Updated</TableHead>
                  <TableHead className="text-xs font-sans-body w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map((doc) => {
                  const st = STATUS_CONFIG[doc.status];
                  return (
                    <TableRow key={doc.id} className="cursor-pointer">
                      <TableCell className="text-xs font-mono text-muted-foreground">{doc.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm font-sans-body text-foreground">{doc.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{doc.collection}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-[10px] ${TYPE_COLOR[doc.type] || ""}`}>{doc.type}</Badge>
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">{doc.chunks}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{doc.size}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] gap-1 ${st.class}`}>
                          <st.icon className="h-3 w-3" />
                          {st.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{doc.updated}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredDocs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-sm text-muted-foreground">No documents found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground font-sans-body">
              Showing {view === "collections" ? filteredCollections.length : filteredDocs.length} items
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" className="h-7 min-w-7 text-xs">1</Button>
              <Button variant="ghost" size="sm" className="h-7 min-w-7 text-xs">2</Button>
              <Button variant="outline" size="icon" className="h-7 w-7"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
