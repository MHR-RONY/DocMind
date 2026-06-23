import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tags, Plus, MoreHorizontal, Pencil, Trash2, Search, MessageSquare, FileText, Users, ArrowUpDown } from "lucide-react";

const labels = [
  { id: 1, name: "Bug Report", color: "#ef4444", description: "Issues and bug reports from users", conversations: 42, documents: 8, createdAt: "2024-01-15" },
  { id: 2, name: "Feature Request", color: "#3b82f6", description: "User requests for new features", conversations: 67, documents: 12, createdAt: "2024-01-18" },
  { id: 3, name: "Billing", color: "#f59e0b", description: "Payment and subscription inquiries", conversations: 23, documents: 5, createdAt: "2024-02-01" },
  { id: 4, name: "Onboarding", color: "#10b981", description: "New user onboarding conversations", conversations: 89, documents: 15, createdAt: "2024-02-10" },
  { id: 5, name: "Technical Support", color: "#8b5cf6", description: "Technical troubleshooting requests", conversations: 134, documents: 22, createdAt: "2024-02-14" },
  { id: 6, name: "Feedback", color: "#06b6d4", description: "General product feedback", conversations: 56, documents: 3, createdAt: "2024-03-01" },
  { id: 7, name: "Urgent", color: "#dc2626", description: "High priority items needing immediate attention", conversations: 11, documents: 2, createdAt: "2024-03-05" },
  { id: 8, name: "Sales", color: "#84cc16", description: "Pre-sales and demo inquiries", conversations: 38, documents: 7, createdAt: "2024-03-12" },
];

const stats = [
  { title: "Total Labels", value: labels.length.toString(), icon: Tags, description: "Active labels" },
  { title: "Labeled Conversations", value: "460", icon: MessageSquare, description: "Across all labels" },
  { title: "Labeled Documents", value: "74", icon: FileText, description: "Tagged documents" },
  { title: "Avg per Label", value: "57.5", icon: Users, description: "Conversations per label" },
];

export default function Labels() {
  const [search, setSearch] = useState("");

  const filtered = labels.filter(
    (l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Labels</h1>
          <p className="text-muted-foreground text-sm mt-1">Organize conversations and documents with custom labels</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Create Label
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">All Labels</CardTitle>
              <CardDescription>Manage labels used to categorize conversations and documents</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search labels..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">
                  <span className="inline-flex items-center gap-1">Conversations <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead className="text-center">Documents</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((label) => (
                <TableRow key={label.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                      <span className="font-medium text-foreground">{label.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[240px] truncate">{label.description}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{label.conversations}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{label.documents}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{label.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" /> Edit Label</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete Label</DropdownMenuItem>
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
