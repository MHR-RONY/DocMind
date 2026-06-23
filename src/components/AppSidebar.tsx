import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus, Search, Settings, MessageSquare, FolderOpen, LayoutGrid, Code,
  PanelLeftClose, PanelLeft, Download, ArrowUp, Globe, HelpCircle, Crown, Gift, LogOut, ChevronRight
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const NAV_ITEMS = [
  { title: "New chat", icon: Plus, action: "new-chat" },
  { title: "Search", icon: Search },
  { title: "Customize", icon: Settings },
  { title: "Chats", icon: MessageSquare, action: "chats" },
  { title: "Projects", icon: FolderOpen },
  { title: "Artifacts", icon: LayoutGrid },
  { title: "Code", icon: Code, badge: "Upgrade" },
];

const RECENT_CHATS = [
  "AIOS new version security breach",
  "Using Claude code with Ollama l...",
  "Comparing Qwen3-Coder-Next ...",
  "RAG chatbot stack recommenda...",
  "Expert opinion request on Shop...",
  "Complete e-commerce dashboa...",
  "Monster website package servic...",
  "Claude API pricing for RAG chat...",
  "Multi-vendor ecommerce and tr...",
  "Managing student attendance o...",
  "E-commerce website developme...",
];

const MENU_ITEMS = [
  { icon: Settings, label: "Settings", shortcut: "⌘+Ctrl+,", action: "settings" },
  { icon: Globe, label: "Language", arrow: true },
  { icon: HelpCircle, label: "Get help" },
  null, // separator
  { icon: Crown, label: "Upgrade plan", action: "upgrade" },
  { icon: Download, label: "Get apps and extensions" },
  { icon: Gift, label: "Gift Claude" },
  { icon: HelpCircle, label: "Learn more", arrow: true },
  null,
  { icon: LogOut, label: "Log out" },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
    if (item.action === "new-chat") navigate("/");
    if (item.action === "chats") navigate("/chats");
  };

  const handleMenuClick = (action?: string) => {
    setMenuOpen(false);
    if (action === "settings") {
      navigate("/settings");
    }
    if (action === "upgrade") {
      navigate("/upgrade");
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-3">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <span className="text-base font-semibold text-sidebar-foreground tracking-tight">
              Research AI
            </span>
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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item)}
                    className="gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-[13px] font-sans-body"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <span className="flex-1 flex items-center justify-between">
                        {item.title}
                        {item.badge && (
                          <span className="text-[11px] text-primary border border-primary/30 rounded px-1.5 py-0.5">
                            {item.badge}
                          </span>
                        )}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-sans-body px-3">
              Recents
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {RECENT_CHATS.map((chat) => (
                  <SidebarMenuItem key={chat}>
                    <SidebarMenuButton
                      className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-[13px] font-sans-body truncate"
                    >
                      <span className="truncate">{chat}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center gap-3 hover:bg-sidebar-accent rounded-lg p-1.5 transition-colors">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
                M
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm text-sidebar-foreground font-sans-body truncate">Mehraf</p>
                    <p className="text-[11px] text-muted-foreground font-sans-body">Free plan</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-3.5 w-3.5 text-sidebar-foreground/50" />
                    <ArrowUp className="h-3.5 w-3.5 text-sidebar-foreground/50" />
                  </div>
                </>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-64 p-2 bg-popover border-border rounded-xl shadow-xl"
          >
            <div className="px-2 py-1.5 mb-1">
              <p className="text-xs text-muted-foreground font-sans-body">ronym0358@gmail.com</p>
            </div>
            {MENU_ITEMS.map((item, i) => {
              if (!item) return <Separator key={`sep-${i}`} className="my-1" />;
              return (
                <button
                  key={item.label}
                  onClick={() => handleMenuClick(item.action)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-popover-foreground hover:bg-secondary font-sans-body transition-colors"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-xs text-muted-foreground">{item.shortcut}</span>
                  )}
                  {item.arrow && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>
      </SidebarFooter>
    </Sidebar>
  );
}
