import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { fetchSessions, createSession, type ChatSession } from "@/lib/chat";
import { ApiRequestError } from "@/lib/api";

const SESSIONS_QUERY_KEY = ["chat", "sessions"] as const;

/** Turns an ISO timestamp into a short relative label like "3 hours ago". */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";

  const units: [limit: number, secs: number, label: string][] = [
    [60, 60, "minute"],
    [24, 3600, "hour"],
    [7, 86400, "day"],
    [4.345, 604800, "week"],
    [12, 2629800, "month"],
    [Number.POSITIVE_INFINITY, 31557600, "year"],
  ];

  for (const [limit, secs, label] of units) {
    const value = Math.floor(seconds / secs);
    if (seconds < limit * secs) {
      return `${value} ${label}${value === 1 ? "" : "s"} ago`;
    }
  }
  return "";
}

const Chats = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: sessions,
    isLoading,
    isError,
    error,
  } = useQuery<ChatSession[]>({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: fetchSessions,
  });

  const { mutate: startNewChat, isPending: isCreating } = useMutation({
    mutationFn: () => createSession(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      navigate("/");
    },
    onError: (err) => {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "Could not start a new chat. Please try again.";
      toast.error(message);
    },
  });

  const filtered = (sessions ?? []).filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()),
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
                onClick={() => startNewChat()}
                disabled={isCreating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-secondary text-sm text-foreground font-sans-body transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
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
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : isError ? (
                <div className="py-12 text-center text-sm text-muted-foreground font-sans-body">
                  {error instanceof ApiRequestError
                    ? error.message
                    : "Couldn't load your chats. Please try again."}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground font-sans-body">
                  {searchQuery
                    ? "No chats found"
                    : "No chats yet. Start a new one."}
                </div>
              ) : (
                filtered.map((chat) => (
                  <button
                    key={chat._id}
                    onClick={() => navigate("/")}
                    className="w-full text-left px-4 py-4 hover:bg-secondary/50 transition-colors flex flex-col gap-1"
                  >
                    <span className="text-sm font-medium text-foreground font-sans-body">
                      {chat.title}
                    </span>
                    <span className="text-xs text-muted-foreground font-sans-body">
                      Last updated {relativeTime(chat.updatedAt)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Chats;
