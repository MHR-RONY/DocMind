import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Settings as SettingsIcon, Building2, Palette, Bot, Database, CreditCard,
  Globe, Mail, Bell, Key, Trash2, Upload, Save, RefreshCw, Sparkles,
  Zap, HardDrive, DollarSign, Calendar, Check,
} from "lucide-react";

const stats = [
  { title: "Plan", value: "Enterprise", icon: Sparkles, description: "Renews May 12, 2026" },
  { title: "API Calls", value: "284K", icon: Zap, description: "of 500K this month" },
  { title: "Storage", value: "42 GB", icon: HardDrive, description: "of 100 GB used" },
  { title: "Monthly Cost", value: "$1,249", icon: DollarSign, description: "Last invoice" },
];

const models = [
  { id: "claude-sonnet-4.6", name: "Claude Sonnet 4.6", provider: "Anthropic", default: true },
  { id: "gpt-5", name: "GPT-5", provider: "OpenAI", default: false },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", default: false },
  { id: "llama-3.3", name: "Llama 3.3 70B", provider: "Meta", default: false },
];

const invoices = [
  { id: "INV-2026-04", date: "Apr 12, 2026", amount: "$1,249.00", status: "paid" },
  { id: "INV-2026-03", date: "Mar 12, 2026", amount: "$1,249.00", status: "paid" },
  { id: "INV-2026-02", date: "Feb 12, 2026", amount: "$1,180.00", status: "paid" },
  { id: "INV-2026-01", date: "Jan 12, 2026", amount: "$1,180.00", status: "paid" },
];

export default function Settings() {
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([4096]);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight">Settings</h1>
          <p className="text-sm font-sans-body text-muted-foreground mt-1">
            Configure your workspace, AI models, billing, and integrations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-sans-body font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-semibold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="general">
            <Building2 className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Bot className="h-4 w-4 mr-2" />
            AI Models
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="h-4 w-4 mr-2" />
            Data
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Workspace</CardTitle>
              <CardDescription>Manage organization details visible to your team and end-users.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </Button>
                  <Button variant="ghost" size="sm">Remove</Button>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input id="org-name" defaultValue="Acme Corporation" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-slug">Workspace URL</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                      app.com/
                    </span>
                    <Input id="org-slug" defaultValue="acme" className="rounded-l-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-email">Support Email</Label>
                  <Input id="org-email" type="email" defaultValue="support@acme.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-timezone">Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger id="org-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                      <SelectItem value="cet">CET (Central European Time)</SelectItem>
                      <SelectItem value="jst">JST (Japan Standard Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="org-desc">Description</Label>
                  <Textarea
                    id="org-desc"
                    defaultValue="A modern RAG platform powering customer support and internal knowledge discovery."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Localization</CardTitle>
              <CardDescription>Set default language and regional preferences.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select defaultValue="mdy">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="jpy">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Customize how the dashboard looks for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {["Light", "Dark", "System"].map((mode, i) => (
                  <button
                    key={mode}
                    className={`relative rounded-lg border-2 ${i === 1 ? "border-primary" : "border-border"} p-4 hover:border-primary/50 transition-colors`}
                  >
                    <div className={`h-20 rounded-md mb-3 ${i === 0 ? "bg-white border border-border" : i === 1 ? "bg-slate-900" : "bg-gradient-to-r from-white to-slate-900"}`} />
                    <div className="text-sm font-medium text-left">{mode}</div>
                    {i === 1 && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <Separator />
              <div className="space-y-3">
                <Label>Accent Color</Label>
                <div className="flex gap-3 flex-wrap">
                  {["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-green-500", "bg-teal-500"].map((color, i) => (
                    <button
                      key={color}
                      className={`h-10 w-10 rounded-full ${color} ring-offset-2 ring-offset-background hover:ring-2 ring-foreground transition-all ${i === 0 ? "ring-2" : ""}`}
                    />
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                {[
                  { label: "Compact mode", desc: "Reduce spacing throughout the UI" },
                  { label: "Reduced motion", desc: "Minimize animations and transitions" },
                  { label: "High contrast", desc: "Improve visibility with stronger color contrast" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                    <Switch />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chat Interface</CardTitle>
              <CardDescription>Customize the end-user chat experience.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bot Name</Label>
                <Input defaultValue="Sage Assistant" />
              </div>
              <div className="space-y-2">
                <Label>Welcome Message</Label>
                <Input defaultValue="Hi! How can I help you today?" />
              </div>
              <div className="space-y-2">
                <Label>Bubble Position</Label>
                <Select defaultValue="br">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="br">Bottom Right</SelectItem>
                    <SelectItem value="bl">Bottom Left</SelectItem>
                    <SelectItem value="tr">Top Right</SelectItem>
                    <SelectItem value="tl">Top Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select defaultValue="inter">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Models */}
        <TabsContent value="ai" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Model</CardTitle>
              <CardDescription>Pick the LLM that powers responses across the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {models.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${m.default ? "border-primary bg-primary/5" : "border-border"} hover:border-primary/50 transition-colors cursor-pointer`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.provider}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.default && <Badge>Default</Badge>}
                    <Button variant="ghost" size="sm">{m.default ? "Configure" : "Select"}</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generation Parameters</CardTitle>
              <CardDescription>Fine-tune how the model produces responses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Temperature</Label>
                  <span className="text-sm font-mono text-muted-foreground">{temperature[0].toFixed(2)}</span>
                </div>
                <Slider value={temperature} onValueChange={setTemperature} min={0} max={2} step={0.05} />
                <p className="text-xs text-muted-foreground">Lower = focused & deterministic. Higher = creative & varied.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Max Tokens</Label>
                  <span className="text-sm font-mono text-muted-foreground">{maxTokens[0]}</span>
                </div>
                <Slider value={maxTokens} onValueChange={setMaxTokens} min={256} max={8192} step={256} />
                <p className="text-xs text-muted-foreground">Maximum length of generated responses.</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>System Prompt</Label>
                <Textarea
                  rows={5}
                  defaultValue="You are a helpful assistant for Acme Corporation. Answer using only the provided context. If you don't know the answer, say so honestly."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Embedding Model</CardTitle>
              <CardDescription>Used to vectorize your knowledge base.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select defaultValue="text-embedding-3-large">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
                    <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
                    <SelectItem value="voyage-3">voyage-3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chunk Size</Label>
                <Input type="number" defaultValue={512} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data */}
        <TabsContent value="data" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
              <CardDescription>Control how long conversations and logs are stored.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Conversations</Label>
                  <Select defaultValue="365">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Audit Logs</Label>
                  <Select defaultValue="180">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                {[
                  { label: "Anonymize PII", desc: "Automatically redact emails, phone numbers, and names" },
                  { label: "Allow training on data", desc: "Use anonymized data to improve model performance" },
                  { label: "Auto-delete old data", desc: "Permanently delete data past the retention period" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                    <Switch defaultChecked={item.label === "Auto-delete old data"} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export & Import</CardTitle>
              <CardDescription>Backup or migrate your workspace data.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button variant="outline">
                <HardDrive className="h-4 w-4" />
                Export All Data
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4" />
                Import from JSON
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4" />
                Schedule Backups
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions. Proceed with caution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30">
                <div>
                  <div className="text-sm font-medium">Reset all conversations</div>
                  <div className="text-xs text-muted-foreground">Permanently delete every chat in this workspace.</div>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                  Reset
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30">
                <div>
                  <div className="text-sm font-medium">Delete workspace</div>
                  <div className="text-xs text-muted-foreground">This will erase all data, users, and integrations.</div>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-4 mt-6">
          <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="mb-2">Current Plan</Badge>
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                  <CardDescription>Unlimited seats, dedicated support, custom SLAs.</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-display font-semibold">$1,249</div>
                  <div className="text-sm text-muted-foreground">/month</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                  { label: "API Calls", used: "284K", total: "500K" },
                  { label: "Storage", used: "42 GB", total: "100 GB" },
                  { label: "Seats", used: "23", total: "Unlimited" },
                  { label: "Models", used: "4", total: "All" },
                ].map((u) => (
                  <div key={u.label}>
                    <div className="text-xs text-muted-foreground">{u.label}</div>
                    <div className="text-sm font-medium">
                      {u.used} <span className="text-muted-foreground">/ {u.total}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button>Upgrade Plan</Button>
                <Button variant="outline">Cancel Subscription</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Cards used for monthly billing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div>
                    <div className="text-sm font-medium">•••• •••• •••• 4242</div>
                    <div className="text-xs text-muted-foreground">Expires 09/2028</div>
                  </div>
                </div>
                <Badge variant="secondary">Primary</Badge>
              </div>
              <Button variant="outline" size="sm">
                <CreditCard className="h-4 w-4" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Download past invoices for accounting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{inv.id}</div>
                      <div className="text-xs text-muted-foreground">{inv.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{inv.amount}</span>
                    <Badge variant="secondary" className="capitalize">{inv.status}</Badge>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage programmatic access to your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Production Key</div>
                    <div className="text-xs text-muted-foreground font-mono">sk_live_••••••••••••wXyZ</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Regenerate</Button>
                  <Button variant="ghost" size="sm">Revoke</Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Development Key</div>
                    <div className="text-xs text-muted-foreground font-mono">sk_test_••••••••••••aBcD</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Regenerate</Button>
                  <Button variant="ghost" size="sm">Revoke</Button>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Key className="h-4 w-4" />
                Create New Key
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>Receive real-time events at your endpoint.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Endpoint URL</Label>
                <Input defaultValue="https://api.acme.com/webhooks/sage" />
              </div>
              <div className="space-y-2">
                <Label>Signing Secret</Label>
                <div className="flex gap-2">
                  <Input readOnly value="whsec_••••••••••••••••••" className="font-mono" />
                  <Button variant="outline">Reveal</Button>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Events to Send</Label>
                {["conversation.created", "conversation.completed", "message.flagged", "user.signup"].map((evt) => (
                  <div key={evt} className="flex items-center justify-between">
                    <code className="text-xs bg-muted px-2 py-1 rounded">{evt}</code>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Developer Options</CardTitle>
              <CardDescription>Toggles for advanced behaviors and beta features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Debug mode", desc: "Show verbose logs in the browser console" },
                { label: "Beta features", desc: "Enable experimental capabilities before general release" },
                { label: "Streaming responses", desc: "Stream tokens as they're generated" },
                { label: "Cache responses", desc: "Cache identical queries for 24 hours" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <Switch defaultChecked={item.label === "Streaming responses" || item.label === "Cache responses"} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
