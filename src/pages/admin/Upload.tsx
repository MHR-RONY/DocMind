import { useRef, useState } from "react";
import {
  Upload as UploadIcon, FileText, File, X,
  CheckCircle2, AlertCircle, Loader2, Layers, Clock
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchDocuments, uploadDocument } from "@/lib/admin";
import type { SafeDocument } from "@/lib/types";
import { ApiRequestError } from "@/lib/api";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.docx,.txt";

const ACCEPTED = [
  { ext: "PDF", icon: FileText, color: "text-red-500", desc: "Adobe PDF documents" },
  { ext: "DOCX", icon: FileText, color: "text-blue-500", desc: "Microsoft Word" },
  { ext: "TXT", icon: File, color: "text-muted-foreground", desc: "Plain text files" },
];

function fileIcon(type: SafeDocument["fileType"]) {
  if (type === "pdf") return <FileText className="h-5 w-5 text-red-500" />;
  if (type === "docx") return <FileText className="h-5 w-5 text-blue-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function statusBadge(s: SafeDocument["status"]) {
  const map = {
    processing: { label: "Processing", icon: Loader2, cls: "bg-blue-500/10 text-blue-500 border-blue-500/20", spin: true },
    ready: { label: "Ready", icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", spin: false },
    failed: { label: "Failed", icon: AlertCircle, cls: "bg-destructive/10 text-destructive border-destructive/20", spin: false },
  };
  const { label, icon: Icon, cls, spin } = map[s];
  return (
    <Badge variant="outline" className={`${cls} gap-1`}>
      <Icon className={`h-3 w-3 ${spin ? "animate-spin" : ""}`} />
      {label}
    </Badge>
  );
}

export default function UploadPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const { data: documents, isLoading, isError, error } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDocument(file),
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success(`Uploaded ${doc.originalName}`);
    },
    onError: (err) => {
      toast.error(err instanceof ApiRequestError ? err.message : "Upload failed");
    },
  });

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      toast.error("File exceeds the 10MB limit");
      return;
    }
    uploadMutation.mutate(file);
  }

  const list: SafeDocument[] = documents ?? [];
  const filtered = list.filter((f) => {
    const matchSearch = f.originalName.toLowerCase().includes(search.toLowerCase());
    if (tab === "all") return matchSearch;
    return matchSearch && f.status === tab;
  });

  const totalChunks = list.reduce((a, d) => a + d.chunkCount, 0);
  const processingCount = list.filter((d) => d.status === "processing").length;
  const readyCount = list.filter((d) => d.status === "ready").length;
  const failedCount = list.filter((d) => d.status === "failed").length;
  const errorMessage =
    error instanceof ApiRequestError ? error.message : "Failed to load documents";

  const STATS = [
    { label: "Total Files", value: list.length, icon: FileText, change: `${readyCount} ready` },
    { label: "Total Chunks", value: totalChunks.toLocaleString(), icon: Layers, change: "Across all docs" },
    { label: "Processing", value: processingCount, icon: Clock, change: "In queue" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-sans-body">Upload Documents</h1>
        <p className="text-sm text-muted-foreground font-sans-body mt-1">
          Upload files to be processed, chunked, and indexed into the knowledge base for RAG retrieval.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
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
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <CardContent className="flex flex-col items-center justify-center py-14 gap-4">
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-colors ${
            dragOver ? "bg-primary/20" : "bg-primary/10"
          }`}>
            {uploadMutation.isPending ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <UploadIcon className={`h-8 w-8 text-primary transition-transform ${dragOver ? "scale-110" : ""}`} />
            )}
          </div>
          <div className="text-center space-y-1">
            <p className="text-base font-semibold font-sans-body">
              {uploadMutation.isPending ? "Uploading…" : "Drag & drop a file here"}
            </p>
            <p className="text-sm text-muted-foreground font-sans-body">or click to browse from your computer</p>
          </div>
          <Button
            size="sm"
            className="gap-2"
            disabled={uploadMutation.isPending}
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          >
            <UploadIcon className="h-4 w-4" />
            Browse Files
          </Button>
          <p className="text-xs text-muted-foreground font-sans-body">Max file size: 10 MB · PDF, DOCX, TXT only</p>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
              <TabsTrigger value="all" className="text-xs font-sans-body px-3 h-7">All ({list.length})</TabsTrigger>
              <TabsTrigger value="ready" className="text-xs font-sans-body px-3 h-7">Ready ({readyCount})</TabsTrigger>
              <TabsTrigger value="processing" className="text-xs font-sans-body px-3 h-7">Processing ({processingCount})</TabsTrigger>
              <TabsTrigger value="failed" className="text-xs font-sans-body px-3 h-7">Failed ({failedCount})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive font-sans-body text-center py-8">{errorMessage}</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground font-sans-body text-center py-8">No documents yet</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground font-sans-body text-center py-8">No files match your filter.</p>
          ) : (
            filtered.map((f) => (
              <div key={f.id} className="flex items-center gap-4 rounded-lg border p-4 hover:bg-accent/30 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  {fileIcon(f.fileType)}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium font-sans-body truncate">{f.originalName}</p>
                    {statusBadge(f.status)}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-sans-body">
                    <span>{formatBytes(f.fileSize)}</span>
                    {f.chunkCount ? <span>{f.chunkCount} chunks</span> : null}
                    <span>{formatDate(f.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
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
              { step: "1", title: "Upload", desc: "File validated and parsed in memory" },
              { step: "2", title: "Parse", desc: "Text extracted using native parsers" },
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
