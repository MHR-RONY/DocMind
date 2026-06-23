import { useState, useRef, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isLoading: boolean;
}

const ChatInput = ({ onSend, onStop, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 w-full">
      <div className="relative rounded-xl border border-border bg-card shadow-lg shadow-black/20 overflow-hidden focus-within:border-primary/40 transition-colors">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a research question..."
          rows={1}
          className={cn(
            "w-full resize-none bg-transparent px-4 pt-4 pb-12 text-sm text-foreground font-sans-body",
            "placeholder:text-muted-foreground focus:outline-none",
            "scrollbar-thin"
          )}
        />

        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground mr-1 hidden sm:inline">
            Shift+Enter for new line
          </span>
          {isLoading ? (
            <button
              onClick={onStop}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/80 text-destructive-foreground hover:bg-destructive transition-colors"
            >
              <Square className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                input.trim()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <p className="text-center text-[10px] text-muted-foreground mt-2 font-sans-body">
        Research AI can make mistakes. Verify important information.
      </p>
    </div>
  );
};

export default ChatInput;
