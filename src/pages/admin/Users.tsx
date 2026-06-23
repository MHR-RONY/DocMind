import { useState } from "react";
import { Users, Search, Filter, MoreHorizontal, Shield, Mail, Ban, CheckCircle2, Clock, UserPlus, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const USERS = [
  { id: 1, name: "Sarah Johnson", email: "sarah@example.com", role: "admin", status: "active", lastActive: "2 min ago", conversations: 234, joined: "2024-11-15" },
  { id: 2, name: "Michael Chen", email: "michael@example.com", role: "admin", status: "active", lastActive: "1 hour ago", conversations: 189, joined: "2024-12-01" },
  { id: 3, name: "Emily Davis", email: "emily@example.com", role: "moderator", status: "active", lastActive: "30 min ago", conversations: 456, joined: "2025-01-10" },
  { id: 4, name: "James Wilson", email: "james@example.com", role: "user", status: "active", lastActive: "5 min ago", conversations: 78, joined: "2025-02-20" },
  { id: 5, name: "Olivia Martinez", email: "olivia@example.com", role: "user", status: "inactive", lastActive: "3 days ago", conversations: 23, joined: "2025-03-05" },
  { id: 6, name: "Robert Taylor", email: "robert@example.com", role: "moderator", status: "active", lastActive: "15 min ago", conversations: 312, joined: "2025-01-22" },
  { id: 7, name: "Sophia Brown", email: "sophia@example.com", role: "user", status: "suspended", lastActive: "2 weeks ago", conversations: 5, joined: "2025-03-18" },
  { id: 8, name: "Daniel Lee", email: "daniel@example.com", role: "user", status: "active", lastActive: "Just now", conversations: 145, joined: "2025-02-08" },
  { id: 9, name: "Ava Anderson", email: "ava@example.com", role: "user", status: "active", lastActive: "45 min ago", conversations: 67, joined: "2025-03-25" },
  { id: 10, name: "William Thomas", email: "william@example.com", role: "user", status: "inactive", lastActive: "1 week ago", conversations: 12, joined: "2025-04-01" },
];

const roleColor: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  moderator: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  user: "bg-muted text-muted-foreground border-border",
};

const statusColor: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  inactive: "bg-muted text-muted-foreground border-border",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusIcon: Record<string, React.ReactNode> = {
  active: <CheckCircle2 className="h-3 w-3" />,
  inactive: <Clock className="h-3 w-3" />,
  suspended: <Ban className="h-3 w-3" />,
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = USERS.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const activeCount = USERS.filter(u => u.status === "active").length;
  const totalConversations = USERS.reduce((a, u) => a + u.conversations, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-sans-body text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground font-sans-body mt-1">Manage user accounts, roles, and permissions</p>
        </div>
        <Button className="gap-2"><UserPlus className="h-4 w-4" /> Invite User</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: USERS.length, icon: Users, sub: `${activeCount} active` },
          { label: "Admins", value: USERS.filter(u => u.role === "admin").length, icon: Shield, sub: "Full access" },
          { label: "Conversations", value: totalConversations.toLocaleString(), icon: Activity, sub: "All time" },
          { label: "Suspended", value: USERS.filter(u => u.status === "suspended").length, icon: Ban, sub: "Accounts" },
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
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Conversations</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className={`capitalize ${roleColor[user.role]}`}>{user.role}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={`gap-1 capitalize ${statusColor[user.status]}`}>{statusIcon[user.status]} {user.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.conversations}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.lastActive}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.joined}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2 text-sm"><Shield className="h-3.5 w-3.5" /> Change Role</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-sm"><Mail className="h-3.5 w-3.5" /> Send Email</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-sm text-destructive"><Ban className="h-3.5 w-3.5" /> Suspend User</DropdownMenuItem>
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
