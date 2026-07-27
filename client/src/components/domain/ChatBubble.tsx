import { cn } from "../../lib/utils";
import { linkifyText } from "../../lib/linkify";

interface ChatBubbleProps {
  content: string;
  isOwn: boolean;
  timestamp: string;
}

export function ChatBubble({ content, isOwn, timestamp }: ChatBubbleProps) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
          isOwn
            ? "text-white rounded-br-md"
            : "glass text-theme rounded-bl-md"
        )}
        style={isOwn ? { background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))" } : undefined}
      >
        <p className="whitespace-pre-wrap break-words">
          {linkifyText(content, isOwn ? "underline underline-offset-2 text-white/95 hover:text-white" : undefined)}
        </p>
        <time className="mt-1 block text-[10px] opacity-60">
          {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </time>
      </div>
    </div>
  );
}
