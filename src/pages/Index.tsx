import { useState, useRef, useEffect } from "react";
import { Sparkles, Menu, ChevronDown, Ghost, Mic, AudioLines, Plus } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME_SUGGESTIONS = [
  { label: "✏️ Write", desc: "Write" },
  { label: "🌐 Learn", desc: "Learn" },
  { label: "</> Code", desc: "Code" },
  { label: "📋 Life stuff", desc: "Life stuff" },
  { label: "💎 Research", desc: "Claude's choice" },
];

// ---------- Mobile-only input bar (matches reference image) ----------
const MobileChatInput = ({
  onSend,
  isLoading,
}: {
  onSend: (m: string) => void;
  isLoading: boolean;
}) => {
  const [input, setInput] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 140) + "px";
    }
  }, [input]);

  const submit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="px-3 pb-4 pt-2">
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur px-4 pt-3 pb-2">
        <textarea
          ref={taRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Chat with Claude"
          className="w-full resize-none bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none font-sans-body"
        />
        <div className="flex items-center justify-between mt-2">
          <button
            type="button"
            className="h-9 w-9 rounded-full flex items-center justify-center text-foreground/70 hover:bg-secondary transition-colors"
            aria-label="Add"
          >
            <Plus className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={submit}
              className="h-9 w-9 rounded-full flex items-center justify-center bg-secondary text-foreground/80 hover:bg-secondary/80 transition-colors"
              aria-label="Voice input"
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={submit}
              className="h-9 w-9 rounded-full flex items-center justify-center bg-foreground text-background hover:opacity-90 transition-opacity"
              aria-label="Send"
            >
              <AudioLines className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Mobile layout ----------
const MobileLayout = ({
  messages,
  isLoading,
  isEmpty,
  onSend,
  bottomRef,
}: {
  messages: Msg[];
  isLoading: boolean;
  isEmpty: boolean;
  onSend: (m: string) => void;
  bottomRef: React.RefObject<HTMLDivElement>;
}) => {
  const { toggleSidebar } = useSidebar();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "How can I help you this morning?";
    if (h < 18) return "How can I help you this afternoon?";
    return "How can I help you this evening?";
  })();

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
        <button
          onClick={toggleSidebar}
          className="h-10 w-10 rounded-full border border-border/60 flex items-center justify-center text-foreground/80 hover:bg-secondary transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button className="flex items-center gap-1.5 text-foreground font-sans-body">
          <span className="text-base font-medium underline underline-offset-4 decoration-border">
            Sonnet 4.6
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          className="h-10 w-10 rounded-full border border-border/60 flex items-center justify-center text-foreground/80 hover:bg-secondary transition-colors"
          aria-label="Modes"
        >
          <Ghost className="h-5 w-5" />
        </button>
      </header>

      {/* Upgrade banner */}
      {isEmpty && (
        <div className="mx-3 mb-2 rounded-full border border-border/60 px-4 py-2.5 flex items-center justify-between shrink-0">
          <span className="text-sm text-foreground font-sans-body">Get more with Claude Pro</span>
          <button className="text-sm font-medium text-primary font-sans-body">Upgrade</button>
        </div>
      )}

      {/* Body */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center px-6 -mt-12">
            <Sparkles className="h-9 w-9 text-primary mb-5" strokeWidth={1.5} />
            <h1 className="text-2xl font-medium text-foreground/90 text-center tracking-tight font-sans-body">
              {greeting}
            </h1>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                role={msg.role}
                content={msg.content}
                isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Bottom input */}
      <div className="shrink-0">
        <MobileChatInput onSend={onSend} isLoading={isLoading} />
      </div>
    </div>
  );
};

// ---------- Desktop layout (unchanged) ----------
const DesktopLayout = ({
  messages,
  isLoading,
  isEmpty,
  onSend,
  bottomRef,
}: {
  messages: Msg[];
  isLoading: boolean;
  isEmpty: boolean;
  onSend: (m: string) => void;
  bottomRef: React.RefObject<HTMLDivElement>;
}) => {
  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground tracking-tight font-sans">
                Good afternoon, Mehraf
              </h2>
            </div>

            <div className="w-full max-w-2xl mb-6">
              <ChatInput onSend={onSend} isLoading={isLoading} />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {WELCOME_SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => onSend(s.desc)}
                  className="px-4 py-2 rounded-full border border-border bg-card hover:bg-secondary hover:border-primary/30 transition-all text-xs text-foreground/80 font-sans-body"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-6">
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                role={msg.role}
                content={msg.content}
                isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {!isEmpty && (
        <div className="pb-4 pt-2">
          <ChatInput onSend={onSend} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
};

const Index = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const simulateResponse = async (userMessage: string) => {
    setIsLoading(true);
    const response = `Based on your query about "${userMessage}", here are the key findings from my research analysis:\n\n**Key Points:**\n\n1. The current literature suggests significant progress in this area, with multiple peer-reviewed studies supporting the main hypotheses.\n\n2. Recent meta-analyses have shown a strong correlation between the variables you've mentioned, with effect sizes ranging from moderate to large.\n\n3. However, there are notable limitations in the existing research, including sample size constraints and potential publication bias.\n\n**Recommendations:**\n\n- Consider exploring the methodological frameworks proposed by recent systematic reviews.\n- Cross-reference findings with databases like PubMed, Scopus, and Web of Science for comprehensive coverage.\n- Pay attention to preprint servers for the most cutting-edge developments.\n\nWould you like me to dive deeper into any of these areas?`;

    let current = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    for (let i = 0; i < response.length; i++) {
      current += response[i];
      const snapshot = current;
      setMessages((prev) =>
        prev.map((m, idx) => (idx === prev.length - 1 ? { ...m, content: snapshot } : m))
      );
      await new Promise((r) => setTimeout(r, 8 + Math.random() * 12));
    }
    setIsLoading(false);
  };

  const handleSend = (message: string) => {
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    simulateResponse(message);
  };

  const isEmpty = messages.length === 0;

  return (
    <SidebarProvider>
      <div className={cn("min-h-screen flex w-full", isMobile && "h-[100dvh] overflow-hidden")}>
        <AppSidebar />
        {isMobile ? (
          <MobileLayout
            messages={messages}
            isLoading={isLoading}
            isEmpty={isEmpty}
            onSend={handleSend}
            bottomRef={bottomRef}
          />
        ) : (
          <DesktopLayout
            messages={messages}
            isLoading={isLoading}
            isEmpty={isEmpty}
            onSend={handleSend}
            bottomRef={bottomRef}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default Index;
