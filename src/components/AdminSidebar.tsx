import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, MessageSquare, Users, Database, FileText, Settings,
  BarChart3, Brain, BookOpen, Shield, Bell, Plug, Upload, Tag,
  PanelLeftClose, PanelLeft, ChevronDown
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const MAIN_NAV = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { title: "Conversations", icon: MessageSquare, path: "/admin/conversations" },
  { title: "Analytics", icon: BarChart3, path: "/admin/analytics" },
];

const RAG_NAV = [
  { title: "Knowledge Base", icon: BookOpen, path: "/admin/knowledge-base" },
  { title: "Documents", icon: FileText, path: "/admin/documents" },
  { title: "Data Sources", icon: Database, path: "/admin/data-sources" },
  { title: "Embeddings", icon: Brain, path: "/admin/embeddings" },
  { title: "Upload", icon: Upload, path: "/admin/upload" },
];

const MANAGEMENT_NAV = [
  { title: "Users", icon: Users, path: "/admin/users" },
  { title: "API & Integrations", icon: Plug, path: "/admin/integrations" },
  { title: "Labels & Tags", icon: Tag, path: "/admin/labels" },
  { title: "Notifications", icon: Bell, path: "/admin/notifications" },
  { title: "Security", icon: Shield, path: "/admin/security" },
  { title: "Settings", icon: Settings, path: "/admin/settings" },
];

function NavSection({ label, items, collapsed }: { label: string; items: typeof MAIN_NAV; collapsed: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <SidebarGroup>
      {!collapsed && (
        <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans-body px-3 mb-1">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "gap-3 text-[13px] font-sans-body transition-colors",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                  {!collapsed && <span>{item.title}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AdminSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-3">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-sidebar-foreground tracking-tight font-sans-body">
                RAG Admin
              </span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        <NavSection label="Overview" items={MAIN_NAV} collapsed={collapsed} />
        <NavSection label="RAG System" items={RAG_NAV} collapsed={collapsed} />
        <NavSection label="Management" items={MANAGEMENT_NAV} collapsed={collapsed} />
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 hover:bg-sidebar-accent rounded-lg p-1.5 transition-colors">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
            A
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm text-sidebar-foreground font-sans-body truncate">Admin</p>
              <p className="text-[11px] text-muted-foreground font-sans-body">Super Admin</p>
            </div>
          )}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
