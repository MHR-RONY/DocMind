import { cn } from "@/lib/utils";
import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const ChatMessage = ({ role, content, isStreaming }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in-up group">
      <div className="flex items-start gap-3 max-w-3xl mx-auto px-4">
        <div
          className={cn(
            "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs",
            isUser
              ? "border-border bg-bubble-user text-foreground"
              : "border-primary/30 bg-primary/10 text-primary"
          )}
        >
          {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-semibold uppercase tracking-wider",
              isUser ? "text-muted-foreground" : "text-primary"
            )}>
              {isUser ? "You" : "Research AI"}
            </span>
          </div>

          <div className={cn(
            "text-sm leading-relaxed font-sans-body whitespace-pre-wrap break-words",
            isUser ? "text-foreground" : "text-foreground/90"
          )}>
            {content}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-0.5 bg-terminal-cursor animate-blink align-middle" />
            )}
          </div>

          {!isUser && !isStreaming && content && (
            <button
              onClick={handleCopy}
              className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1 rounded"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-terminal-green" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
