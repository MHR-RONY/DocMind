import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Mail, MessageSquare, AlertTriangle, CheckCircle2, Clock, Settings, Send, Smartphone, Globe, Filter } from "lucide-react";

const recentNotifications = [
  { id: 1, type: "alert", title: "High error rate detected", message: "Error rate exceeded 5% threshold in the last 15 minutes", time: "2 min ago", read: false },
  { id: 2, type: "info", title: "New user registered", message: "john.doe@example.com signed up via Google OAuth", time: "18 min ago", read: false },
  { id: 3, type: "success", title: "Document indexed successfully", message: "product-guide-v3.pdf processed and added to knowledge base", time: "1 hr ago", read: true },
  { id: 4, type: "alert", title: "API rate limit warning", message: "Production API key approaching 80% of daily rate limit", time: "2 hrs ago", read: true },
  { id: 5, type: "info", title: "Webhook delivery failed", message: "Endpoint https://api.client.com/hook returned 503 — retrying", time: "3 hrs ago", read: false },
  { id: 6, type: "success", title: "Backup completed", message: "Daily database backup completed successfully (2.4 GB)", time: "5 hrs ago", read: true },
  { id: 7, type: "info", title: "Scheduled maintenance", message: "System maintenance window scheduled for Sunday 2:00 AM UTC", time: "8 hrs ago", read: true },
];

const channels = [
  { id: "email", label: "Email Notifications", description: "Receive alerts via email", icon: Mail, enabled: true },
  { id: "push", label: "Push Notifications", description: "Browser and mobile push alerts", icon: Smartphone, enabled: true },
  { id: "in-app", label: "In-App Notifications", description: "Show notifications in the admin panel", icon: Bell, enabled: true },
  { id: "webhook", label: "Webhook Alerts", description: "Forward notifications to external endpoints", icon: Globe, enabled: false },
];

const preferences = [
  { category: "Conversations", items: [
    { label: "New conversation started", email: true, push: true, inApp: true },
    { label: "Conversation escalated", email: true, push: true, inApp: true },
    { label: "Negative sentiment detected", email: true, push: false, inApp: true },
    { label: "Conversation closed", email: false, push: false, inApp: true },
  ]},
  { category: "System", items: [
    { label: "High error rate", email: true, push: true, inApp: true },
    { label: "API rate limit warning", email: true, push: true, inApp: true },
    { label: "Service downtime", email: true, push: true, inApp: true },
    { label: "Backup completed", email: false, push: false, inApp: true },
  ]},
  { category: "Users", items: [
    { label: "New user signup", email: false, push: false, inApp: true },
    { label: "User suspended", email: true, push: false, inApp: true },
    { label: "Role changed", email: true, push: false, inApp: true },
  ]},
];

const typeIcon = (type: string) => {
  switch (type) {
    case "alert": return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case "success": return <CheckCircle2 className="h-4 w-4 text-primary" />;
    default: return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
  }
};

const stats = [
  { title: "Unread", value: recentNotifications.filter(n => !n.read).length.toString(), icon: Bell, description: "Pending notifications" },
  { title: "Today", value: "12", icon: Clock, description: "Notifications today" },
  { title: "Emails Sent", value: "48", icon: Send, description: "This week" },
  { title: "Channels", value: channels.filter(c => c.enabled).length.toString(), icon: Settings, description: "Active channels" },
];

export default function Notifications() {
  const [tab, setTab] = useState("feed");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const displayed = filter === "unread" ? recentNotifications.filter(n => !n.read) : recentNotifications;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage alerts, channels, and notification preferences</p>
        </div>
        <Button variant="outline" className="gap-2">
          <CheckCircle2 className="h-4 w-4" /> Mark All Read
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
          <TabsTrigger value="feed">Notification Feed</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Recent Notifications</CardTitle>
                <div className="flex gap-2">
                  <Button variant={filter === "all" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("all")}>All</Button>
                  <Button variant={filter === "unread" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("unread")}>
                    Unread
                    <Badge variant="destructive" className="ml-1.5 text-[10px] px-1.5">{recentNotifications.filter(n => !n.read).length}</Badge>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {displayed.map((n) => (
                <div key={n.id} className={`flex items-start gap-3 rounded-lg p-3 transition-colors ${!n.read ? "bg-accent/50" : "hover:bg-muted/50"}`}>
                  <div className="mt-0.5">{typeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{n.title}</span>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">{n.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Notification Channels</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {channels.map((ch) => (
                <div key={ch.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <ch.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{ch.label}</p>
                      <p className="text-xs text-muted-foreground">{ch.description}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={ch.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          {preferences.map((group) => (
            <Card key={group.category}>
              <CardHeader>
                <CardTitle className="text-foreground text-base">{group.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-[1fr_80px_80px_80px] gap-2 text-xs font-medium text-muted-foreground pb-2 border-b border-border">
                    <span>Event</span>
                    <span className="text-center">Email</span>
                    <span className="text-center">Push</span>
                    <span className="text-center">In-App</span>
                  </div>
                  {group.items.map((item) => (
                    <div key={item.label} className="grid grid-cols-[1fr_80px_80px_80px] gap-2 items-center">
                      <span className="text-sm text-foreground">{item.label}</span>
                      <div className="flex justify-center"><Switch defaultChecked={item.email} className="scale-75" /></div>
                      <div className="flex justify-center"><Switch defaultChecked={item.push} className="scale-75" /></div>
                      <div className="flex justify-center"><Switch defaultChecked={item.inApp} className="scale-75" /></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
