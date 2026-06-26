import { useState } from "react";
import { FileText, Search, Trash2, MoreHorizontal, File, FileCode, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { fetchDocuments, deleteDocument } from "@/lib/admin";
import type { SafeDocument } from "@/lib/types";
import { ApiRequestError } from "@/lib/api";

const statusColor: Record<SafeDocument["status"], string> = {
  ready: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

const typeIcon: Record<SafeDocument["fileType"], React.ReactNode> = {
  pdf: <FileText className="h-4 w-4 text-red-400" />,
  docx: <File className="h-4 w-4 text-blue-500" />,
  txt: <FileCode className="h-4 w-4 text-muted-foreground" />,
};

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

export default function Documents() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<SafeDocument | null>(null);

  const { data: documents, isLoading, isError, error } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted");
    },
    onError: (err) => {
      toast.error(err instanceof ApiRequestError ? err.message : "Delete failed");
    },
    onSettled: () => setPendingDelete(null),
  });

  const list: SafeDocument[] = documents ?? [];
  const filtered = list.filter((d) => d.originalName.toLowerCase().includes(search.toLowerCase()));
  const totalChunks = list.reduce((a, d) => a + d.chunkCount, 0);
  const readyCount = list.filter((d) => d.status === "ready").length;
  const processingCount = list.filter((d) => d.status === "processing").length;
  const errorMessage =
    error instanceof ApiRequestError ? error.message : "Failed to load documents";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-sans-body text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground font-sans-body mt-1">Manage uploaded documents for the RAG pipeline</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Documents", value: list.length, sub: `${readyCount} ready` },
          { label: "Total Chunks", value: totalChunks.toLocaleString(), sub: "Across all docs" },
          { label: "Ready", value: readyCount, sub: "Indexed" },
          { label: "Processing", value: processingCount, sub: "In queue" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-sans-body">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-sans-body">All Documents</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search documents..." className="pl-8 h-9 w-64 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive font-sans-body text-center py-16">{errorMessage}</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground font-sans-body text-center py-16">No documents yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Chunks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium text-sm flex items-center gap-2">
                      {typeIcon[doc.fileType] || <File className="h-4 w-4" />}
                      {doc.originalName}
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[11px] uppercase">{doc.fileType}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatBytes(doc.fileSize)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{doc.chunkCount || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className={`capitalize ${statusColor[doc.status]}`}>{doc.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(doc.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="gap-2 text-sm text-destructive"
                            onClick={() => setPendingDelete(doc)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => { if (!open) setPendingDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes "{pendingDelete?.originalName}" and its indexed chunks. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
              }}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
