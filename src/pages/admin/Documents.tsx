import { useState } from "react";
import { FileText, Upload, Search, Filter, Eye, Trash2, Download, MoreHorizontal, File, FileImage, FileCode, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const DOCUMENTS = [
  { id: 1, name: "Product Documentation v3.2.pdf", type: "PDF", size: "4.2 MB", pages: 128, chunks: 342, status: "indexed", uploadedAt: "2025-04-01", uploadedBy: "Admin" },
  { id: 2, name: "API Reference Guide.md", type: "MD", size: "890 KB", pages: 45, chunks: 156, status: "indexed", uploadedAt: "2025-03-28", uploadedBy: "Admin" },
  { id: 3, name: "FAQ Database.csv", type: "CSV", size: "1.1 MB", pages: 1, chunks: 523, status: "processing", uploadedAt: "2025-04-05", uploadedBy: "System" },
  { id: 4, name: "Training Manual.docx", type: "DOCX", size: "8.7 MB", pages: 234, chunks: 0, status: "queued", uploadedAt: "2025-04-06", uploadedBy: "Admin" },
  { id: 5, name: "Support Tickets Export.json", type: "JSON", size: "3.4 MB", pages: 1, chunks: 891, status: "indexed", uploadedAt: "2025-03-15", uploadedBy: "System" },
  { id: 6, name: "Company Policies.pdf", type: "PDF", size: "2.1 MB", pages: 67, chunks: 189, status: "error", uploadedAt: "2025-04-02", uploadedBy: "Admin" },
  { id: 7, name: "Release Notes 2025.html", type: "HTML", size: "456 KB", pages: 12, chunks: 78, status: "indexed", uploadedAt: "2025-03-20", uploadedBy: "Admin" },
  { id: 8, name: "Troubleshooting Guide.pdf", type: "PDF", size: "5.6 MB", pages: 89, chunks: 267, status: "indexed", uploadedAt: "2025-03-10", uploadedBy: "System" },
];

const statusColor: Record<string, string> = {
  indexed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  queued: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

const typeIcon: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-4 w-4 text-red-400" />,
  MD: <FileCode className="h-4 w-4 text-blue-400" />,
  CSV: <FileSpreadsheet className="h-4 w-4 text-green-400" />,
  DOCX: <File className="h-4 w-4 text-blue-500" />,
  JSON: <FileCode className="h-4 w-4 text-amber-400" />,
  HTML: <FileCode className="h-4 w-4 text-orange-400" />,
};

export default function Documents() {
  const [search, setSearch] = useState("");
  const filtered = DOCUMENTS.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  const totalChunks = DOCUMENTS.reduce((a, d) => a + d.chunks, 0);
  const indexedCount = DOCUMENTS.filter(d => d.status === "indexed").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-sans-body text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground font-sans-body mt-1">Manage uploaded documents for the RAG pipeline</p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" /> Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Documents", value: DOCUMENTS.length, sub: `${indexedCount} indexed` },
          { label: "Total Chunks", value: totalChunks.toLocaleString(), sub: "Across all docs" },
          { label: "Storage Used", value: "26.4 MB", sub: "of 1 GB" },
          { label: "Processing", value: DOCUMENTS.filter(d => d.status === "processing" || d.status === "queued").length, sub: "In queue" },
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
              <Button variant="outline" size="sm" className="gap-1.5"><Filter className="h-3.5 w-3.5" /> Filter</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Pages</TableHead>
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
                    {typeIcon[doc.type] || <File className="h-4 w-4" />}
                    {doc.name}
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[11px]">{doc.type}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{doc.size}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{doc.pages}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{doc.chunks || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColor[doc.status]}>{doc.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{doc.uploadedAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2 text-sm"><Eye className="h-3.5 w-3.5" /> Preview</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-sm"><Download className="h-3.5 w-3.5" /> Download</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-sm text-destructive"><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
