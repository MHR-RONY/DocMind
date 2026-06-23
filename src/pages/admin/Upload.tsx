import { useState } from "react";
import {
  Upload as UploadIcon, FileText, Image, FileSpreadsheet, File, X,
  CheckCircle2, AlertCircle, Loader2, Clock, HardDrive, Layers, BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  sizeBytes: number;
  type: string;
  status: "uploading" | "processing" | "indexed" | "error";
  progress: number;
  chunks?: number;
  uploadedAt: string;
  source: string;
}

const MOCK_FILES: UploadedFile[] = [
  { id: "1", name: "product-manual-v3.pdf", size: "4.2 MB", sizeBytes: 4200000, type: "pdf", status: "indexed", progress: 100, chunks: 142, uploadedAt: "2 hours ago", source: "Manual upload" },
  { id: "2", name: "faq-database.csv", size: "1.8 MB", sizeBytes: 1800000, type: "csv", status: "indexed", progress: 100, chunks: 87, uploadedAt: "5 hours ago", source: "Manual upload" },
  { id: "3", name: "onboarding-guide.docx", size: "2.1 MB", sizeBytes: 2100000, type: "docx", status: "processing", progress: 67, chunks: 0, uploadedAt: "10 mins ago", source: "Manual upload" },
  { id: "4", name: "api-reference.md", size: "340 KB", sizeBytes: 340000, type: "md", status: "uploading", progress: 34, chunks: 0, uploadedAt: "Just now", source: "Manual upload" },
  { id: "5", name: "troubleshooting.pdf", size: "6.7 MB", sizeBytes: 6700000, type: "pdf", status: "error", progress: 100, chunks: 0, uploadedAt: "1 day ago", source: "API upload" },
  { id: "6", name: "release-notes-q1.html", size: "890 KB", sizeBytes: 890000, type: "html", status: "indexed", progress: 100, chunks: 34, uploadedAt: "3 days ago", source: "Web crawler" },
];

const ACCEPTED = [
  { ext: "PDF", icon: FileText, color: "text-red-500", desc: "Adobe PDF documents" },
  { ext: "DOCX", icon: FileText, color: "text-blue-500", desc: "Microsoft Word" },
  { ext: "CSV", icon: FileSpreadsheet, color: "text-green-500", desc: "Comma-separated values" },
  { ext: "MD", icon: FileText, color: "text-muted-foreground", desc: "Markdown files" },
  { ext: "TXT", icon: File, color: "text-muted-foreground", desc: "Plain text files" },
  { ext: "HTML", icon: FileText, color: "text-orange-500", desc: "Web pages" },
  { ext: "JSON", icon: File, color: "text-yellow-500", desc: "Structured JSON data" },
  { ext: "PNG/JPG", icon: Image, color: "text-purple-500", desc: "Images (OCR enabled)" },
];

function fileIcon(type: string) {
  if (type === "pdf") return <FileText className="h-5 w-5 text-red-500" />;
  if (type === "csv") return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  if (type === "docx") return <FileText className="h-5 w-5 text-blue-500" />;
  if (type === "html") return <FileText className="h-5 w-5 text-orange-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

function statusBadge(s: UploadedFile["status"]) {
  const map = {
    uploading: { label: "Uploading", icon: Loader2, cls: "bg-blue-500/10 text-blue-500 border-blue-500/20", spin: true },
    processing: { label: "Processing", icon: Loader2, cls: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", spin: true },
    indexed: { label: "Indexed", icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", spin: false },
    error: { label: "Error", icon: AlertCircle, cls: "bg-destructive/10 text-destructive border-destructive/20", spin: false },
  };
  const { label, icon: Icon, cls, spin } = map[s];
  return (
    <Badge variant="outline" className={`${cls} gap-1`}>
      <Icon className={`h-3 w-3 ${spin ? "animate-spin" : ""}`} />
      {label}
    </Badge>
  );
}

const STATS = [
  { label: "Total Files", value: "24", icon: FileText, change: "+3 today" },
  { label: "Storage Used", value: "156 MB", icon: HardDrive, change: "of 5 GB" },
  { label: "Total Chunks", value: "1,847", icon: Layers, change: "+263 new" },
  { label: "Processing Queue", value: "2", icon: Clock, change: "~4 min left" },
];

export default function UploadPage() {
  const [files] = useState<UploadedFile[]>(MOCK_FILES);
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = files.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    if (tab === "all") return matchSearch;
    return matchSearch && f.status === tab;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-sans-body">Upload Documents</h1>
        <p className="text-sm text-muted-foreground font-sans-body mt-1">
          Upload files to be processed, chunked, and indexed into the knowledge base for RAG retrieval.
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
                  <p className="text-[11px] text-muted-foreground font-sans-body">{s.change}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-all duration-200 cursor-pointer ${
          dragOver
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
            : "border-border hover:border-primary/40 hover:bg-accent/30"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
      >
        <CardContent className="flex flex-col items-center justify-center py-14 gap-4">
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-colors ${
            dragOver ? "bg-primary/20" : "bg-primary/10"
          }`}>
            <UploadIcon className={`h-8 w-8 text-primary transition-transform ${dragOver ? "scale-110" : ""}`} />
          </div>
          <div className="text-center space-y-1">
            <p className="text-base font-semibold font-sans-body">Drag & drop files here</p>
            <p className="text-sm text-muted-foreground font-sans-body">or click to browse from your computer</p>
          </div>
          <Button size="sm" className="gap-2">
            <UploadIcon className="h-4 w-4" />
            Browse Files
          </Button>
          <p className="text-xs text-muted-foreground font-sans-body">Max file size: 50 MB · Batch upload supported</p>
        </CardContent>
      </Card>

      {/* Accepted Formats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-sans-body">Accepted Formats</CardTitle>
          <CardDescription className="font-sans-body text-xs">
            The following file types can be uploaded and processed by the RAG pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ACCEPTED.map((a) => (
              <div key={a.ext} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <a.icon className={`h-5 w-5 shrink-0 ${a.color}`} />
                <div>
                  <p className="text-xs font-medium font-sans-body">{a.ext}</p>
                  <p className="text-[10px] text-muted-foreground font-sans-body">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-sans-body">Recent Uploads</CardTitle>
              <CardDescription className="font-sans-body">Track status, chunks, and processing of uploaded documents.</CardDescription>
            </div>
            <Input
              placeholder="Search files…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-[220px] h-9 text-sm font-sans-body"
            />
          </div>
          <Tabs value={tab} onValueChange={setTab} className="mt-2">
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs font-sans-body px-3 h-7">All ({files.length})</TabsTrigger>
              <TabsTrigger value="indexed" className="text-xs font-sans-body px-3 h-7">Indexed ({files.filter(f => f.status === "indexed").length})</TabsTrigger>
              <TabsTrigger value="processing" className="text-xs font-sans-body px-3 h-7">Processing ({files.filter(f => f.status === "processing").length})</TabsTrigger>
              <TabsTrigger value="error" className="text-xs font-sans-body px-3 h-7">Errors ({files.filter(f => f.status === "error").length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground font-sans-body text-center py-8">No files match your filter.</p>
          )}
          {filtered.map((f) => (
            <div key={f.id} className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent/30 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                {fileIcon(f.type)}
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium font-sans-body truncate">{f.name}</p>
                  {statusBadge(f.status)}
                </div>
                {(f.status === "uploading" || f.status === "processing") && (
                  <Progress value={f.progress} className="h-1.5" />
                )}
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-sans-body">
                  <span>{f.size}</span>
                  {f.chunks ? <span>{f.chunks} chunks</span> : null}
                  <span>{f.uploadedAt}</span>
                  <span className="hidden sm:inline">via {f.source}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {f.status === "error" && (
                  <Button variant="ghost" size="sm" className="text-xs font-sans-body gap-1 text-primary">
                    Retry
                  </Button>
                )}
                <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Processing Pipeline Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-sans-body">Processing Pipeline</CardTitle>
          <CardDescription className="font-sans-body text-xs">How uploaded documents are processed and made available for retrieval.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Upload", desc: "File validated and stored in secure blob storage" },
              { step: "2", title: "Parse", desc: "Text extracted using OCR, markdown, or native parsers" },
              { step: "3", title: "Chunk", desc: "Content split into overlapping semantic chunks" },
              { step: "4", title: "Embed", desc: "Chunks vectorized and indexed for similarity search" },
            ].map((p) => (
              <div key={p.step} className="flex flex-col items-center text-center gap-2 p-4 rounded-lg border bg-card">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {p.step}
                </div>
                <p className="text-sm font-medium font-sans-body">{p.title}</p>
                <p className="text-[11px] text-muted-foreground font-sans-body leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
