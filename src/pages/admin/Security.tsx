import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Shield, ShieldCheck, ShieldAlert, Lock, Key, Eye, AlertTriangle,
  CheckCircle2, XCircle, Clock, Activity, Globe, Users, FileText, RefreshCw,
} from "lucide-react";

const securityScore = 82;

const stats = [
  { title: "Security Score", value: `${securityScore}%`, icon: Shield, description: "Overall health" },
  { title: "Active Threats", value: "0", icon: ShieldAlert, description: "No threats detected" },
  { title: "Policies Active", value: "14", icon: Lock, description: "RLS & auth policies" },
  { title: "Last Scan", value: "2 hrs ago", icon: RefreshCw, description: "Automated scan" },
];

const auditLog = [
  { id: 1, action: "Login", user: "admin@company.com", ip: "192.168.1.42", location: "New York, US", time: "2 min ago", status: "success" },
  { id: 2, action: "Role Changed", user: "admin@company.com", ip: "192.168.1.42", location: "New York, US", time: "15 min ago", status: "success" },
  { id: 3, action: "API Key Created", user: "dev@company.com", ip: "10.0.0.55", location: "London, UK", time: "1 hr ago", status: "success" },
  { id: 4, action: "Failed Login", user: "unknown@test.com", ip: "45.33.12.98", location: "Unknown", time: "2 hrs ago", status: "failed" },
  { id: 5, action: "Document Deleted", user: "editor@company.com", ip: "172.16.0.12", location: "Berlin, DE", time: "3 hrs ago", status: "success" },
  { id: 6, action: "Settings Updated", user: "admin@company.com", ip: "192.168.1.42", location: "New York, US", time: "5 hrs ago", status: "success" },
  { id: 7, action: "Failed Login", user: "admin@company.com", ip: "89.12.45.67", location: "Moscow, RU", time: "8 hrs ago", status: "failed" },
];

const policies = [
  { name: "Row-Level Security", table: "conversations", status: "enabled", rules: 4 },
  { name: "Row-Level Security", table: "documents", status: "enabled", rules: 3 },
  { name: "Row-Level Security", table: "users", status: "enabled", rules: 5 },
  { name: "Row-Level Security", table: "embeddings", status: "enabled", rules: 2 },
  { name: "Row-Level Security", table: "api_keys", status: "disabled", rules: 0 },
];

const securityChecks = [
  { label: "HTTPS Enforced", status: "pass", detail: "All traffic encrypted via TLS 1.3" },
  { label: "Authentication Required", status: "pass", detail: "All endpoints require valid JWT" },
  { label: "Rate Limiting", status: "pass", detail: "100 req/min per IP, 1000 req/min per API key" },
  { label: "CORS Configuration", status: "warn", detail: "Wildcard origin detected — restrict to known domains" },
  { label: "SQL Injection Protection", status: "pass", detail: "Parameterized queries enforced" },
  { label: "XSS Protection", status: "pass", detail: "Content-Security-Policy headers active" },
  { label: "Data Encryption at Rest", status: "pass", detail: "AES-256 encryption for all stored data" },
  { label: "Backup Encryption", status: "warn", detail: "Backups stored without additional encryption layer" },
];

const securitySettings = [
  { id: "2fa", label: "Two-Factor Authentication", description: "Require 2FA for all admin accounts", enabled: true },
  { id: "session", label: "Session Timeout", description: "Auto-logout after 30 minutes of inactivity", enabled: true },
  { id: "ip-whitelist", label: "IP Whitelisting", description: "Restrict admin access to approved IPs only", enabled: false },
  { id: "brute-force", label: "Brute Force Protection", description: "Lock accounts after 5 failed login attempts", enabled: true },
  { id: "password-policy", label: "Strong Password Policy", description: "Minimum 12 chars, uppercase, number, symbol", enabled: true },
  { id: "audit-log", label: "Audit Logging", description: "Log all administrative actions", enabled: true },
];

const checkIcon = (status: string) => {
  if (status === "pass") return <CheckCircle2 className="h-4 w-4 text-primary" />;
  if (status === "warn") return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  return <XCircle className="h-4 w-4 text-destructive" />;
};

export default function Security() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Security</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor threats, audit access, and manage security policies</p>
        </div>
        <Button className="gap-2">
          <RefreshCw className="h-4 w-4" /> Run Security Scan
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

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Security Score</CardTitle>
                <CardDescription>Overall security posture assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24">
                    <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                        strokeDasharray={`${securityScore * 2.51} 251`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground">{securityScore}%</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-foreground font-medium">Good</p>
                    <p className="text-muted-foreground">2 warnings found. Address them to improve your score.</p>
                  </div>
                </div>
                <Progress value={securityScore} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Security Checks</CardTitle>
                <CardDescription>Automated vulnerability assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {securityChecks.map((check) => (
                  <div key={check.label} className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
                    {checkIcon(check.status)}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{check.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{check.detail}</p>
                    </div>
                    <Badge variant={check.status === "pass" ? "secondary" : "outline"} className="ml-auto shrink-0 text-[10px]">
                      {check.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Audit Log</CardTitle>
                  <CardDescription>Track all administrative actions and access events</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2"><FileText className="h-4 w-4" /> Export</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLog.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium text-foreground">{entry.action}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{entry.user}</TableCell>
                      <TableCell><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{entry.ip}</code></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{entry.location}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{entry.time}</TableCell>
                      <TableCell>
                        <Badge variant={entry.status === "success" ? "secondary" : "destructive"} className="text-[10px]">
                          {entry.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies */}
        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">RLS Policies</CardTitle>
              <CardDescription>Row-Level Security policies applied to database tables</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead className="text-center">Rules</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                      <TableCell><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{p.table}</code></TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{p.rules}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.status === "enabled" ? "secondary" : "destructive"} className="text-[10px]">
                          {p.status === "enabled" ? <><ShieldCheck className="h-3 w-3 mr-1" /> Enabled</> : <><ShieldAlert className="h-3 w-3 mr-1" /> Disabled</>}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Security Settings</CardTitle>
              <CardDescription>Configure authentication and access control policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {securitySettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Lock className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{setting.label}</p>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
