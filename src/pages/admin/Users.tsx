import { useState } from "react";
import { Users, Search, MoreHorizontal, Shield, Ban, CheckCircle2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchUsers, setUserBlocked } from "@/lib/admin";
import type { SafeUser } from "@/lib/types";
import { ApiRequestError } from "@/lib/api";

const roleColor: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  user: "bg-muted text-muted-foreground border-border",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: fetchUsers,
  });

  const blockMutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
      setUserBlocked(id, isBlocked),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(updated.isBlocked ? "User blocked" : "User unblocked");
    },
    onError: (err) => {
      toast.error(err instanceof ApiRequestError ? err.message : "Action failed");
    },
  });

  const list: SafeUser[] = users ?? [];
  const filtered = list.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = list.filter((u) => u.role === "admin").length;
  const blockedCount = list.filter((u) => u.isBlocked).length;
  const activeCount = list.length - blockedCount;
  const errorMessage =
    error instanceof ApiRequestError ? error.message : "Failed to load users";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-sans-body text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground font-sans-body mt-1">Manage user accounts, roles, and permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: list.length, icon: Users, sub: `${activeCount} active` },
          { label: "Admins", value: adminCount, icon: Shield, sub: "Full access" },
          { label: "Blocked", value: blockedCount, icon: Ban, sub: "Accounts" },
        ].map((stat) => (
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

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-sans-body">All Users</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search by name or email..." className="pl-8 h-9 w-64 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9 w-36 text-sm">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
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
            <p className="text-sm text-muted-foreground font-sans-body text-center py-16">No users yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-muted text-muted-foreground">{initials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className={`capitalize ${roleColor[user.role]}`}>{user.role}</Badge></TableCell>
                    <TableCell>
                      {user.isBlocked ? (
                        <Badge variant="outline" className="gap-1 bg-destructive/10 text-destructive border-destructive/20">
                          <Ban className="h-3 w-3" /> Blocked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.isBlocked ? (
                            <DropdownMenuItem
                              className="gap-2 text-sm"
                              disabled={blockMutation.isPending}
                              onClick={() => blockMutation.mutate({ id: user.id, isBlocked: false })}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Unblock User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="gap-2 text-sm text-destructive"
                              disabled={blockMutation.isPending}
                              onClick={() => blockMutation.mutate({ id: user.id, isBlocked: true })}
                            >
                              <Ban className="h-3.5 w-3.5" /> Block User
                            </DropdownMenuItem>
                          )}
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
    </div>
  );
}
