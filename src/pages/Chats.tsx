import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const CHATS = [
  { title: "AIOS new version security breach", time: "Last message 11 minutes ago" },
  { title: "Using Claude code with Ollama local models", time: "Last message 19 minutes ago" },
  { title: "Comparing Qwen3-Coder-Next vs Qwen 3.5", time: "Last message 15 hours ago" },
  { title: "RAG chatbot stack recommendation with Claude", time: "Last message 1 day ago" },
  { title: "Expert opinion request on Shop No data breach", time: "Last message 2 days ago" },
  { title: "Complete e-commerce dashboard with inventory and payment integration", time: "Last message 2 days ago" },
  { title: "Monster website package services overview", time: "Last message 2 days ago" },
  { title: "Claude API pricing for RAG chatbot", time: "Last message 3 days ago" },
  { title: "Multi-vendor ecommerce and transport management platform", time: "Last message 3 days ago" },
  { title: "Managing student attendance on university closure days", time: "Last message 4 days ago" },
  { title: "E-commerce website development package 50k", time: "Last message 4 days ago" },
  { title: "Cookie parser in MERN server setup", time: "Last message 5 days ago" },
  { title: "How compound interest works", time: "Last message 5 days ago" },
  { title: "Running multiple Facebook clone instances", time: "Last message 6 days ago" },
  { title: "Game and skin pricing clarification", time: "Last message 1 week ago" },
];

const Chats = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filtered = CHATS.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col h-screen overflow-y-auto scrollbar-thin">
          <div className="px-6 pt-8 pb-16 max-w-3xl w-full mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-foreground font-sans">Chats</h1>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-secondary text-sm text-foreground font-sans-body transition-colors"
              >
                <Plus className="h-4 w-4" />
                New chat
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your chats..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-sans-body focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>

            {/* Label */}
            <div className="flex items-center gap-3 mb-2 px-1">
              <span className="text-sm text-muted-foreground font-sans-body">Your chats with AI</span>
              <button className="text-sm text-primary font-sans-body hover:underline">Select</button>
            </div>

            {/* Chat list */}
            <div className="divide-y divide-border">
              {filtered.map((chat) => (
                <button
                  key={chat.title}
                  onClick={() => navigate("/")}
                  className="w-full text-left px-4 py-4 hover:bg-secondary/50 transition-colors flex flex-col gap-1"
                >
                  <span className="text-sm font-medium text-foreground font-sans-body">
                    {chat.title}
                  </span>
                  <span className="text-xs text-muted-foreground font-sans-body">
                    {chat.time}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground font-sans-body">
                  No chats found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Chats;
