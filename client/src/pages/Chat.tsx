import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { ChatBubble } from "../components/domain/ChatBubble";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { api, type Message, type Conversation } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { useSocket } from "../hooks/useSocket";
import { cn } from "../lib/utils";

function ChatRoom({ conversationId }: { conversationId: string }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => api.getMessages(conversationId),
  });

  useEffect(() => {
    if (data) setMessages(data);
  }, [data]);

  const onMessage = useCallback((msg: Message) => {
    if (msg.sender.id === user?.id) return;
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  }, [queryClient, user?.id]);

  useSocket(conversationId, onMessage);

  const sendMutation = useMutation({
    mutationFn: (content: string) => api.sendMessage(conversationId, content),
    onSuccess: (msg) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      setInput("");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const content = input.trim();
    if (!content || sendMutation.isPending) return;
    sendMutation.mutate(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-3 p-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className={`h-12 ${i % 2 === 0 ? "w-2/3" : "w-1/2 ml-auto"}`} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted py-8">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              content={msg.content}
              isOwn={msg.sender.id === user?.id}
              timestamp={msg.createdAt}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-theme p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-theme px-4 py-2.5 text-sm text-theme placeholder:text-muted/60 focus:border-[var(--color-accent)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
            style={{ backgroundColor: "var(--color-input-bg)" }}
            aria-label="Message input"
          />
          <Button onClick={handleSend} disabled={!input.trim() || sendMutation.isPending} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

function getPartnerInfo(conv: Conversation, userRole: string | null | undefined) {
  if (userRole === "SEEKER") {
    const ref = conv.interest.referrer.referrerProfile;
    return {
      name: ref?.fullName || conv.interest.referrer.email,
      role: ref ? `Referrer · ${ref.jobTitle} at ${ref.company}` : "Referrer",
    };
  }
  const seeker = conv.interest.seeker.seekerProfile;
  return {
    name: seeker?.fullName || conv.interest.seeker.email,
    role: seeker?.headline || seeker?.desiredRoles?.[0] || "Job Seeker",
  };
}

export default function Chat() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.getConversations(),
  });

  const { user } = useAuthStore();
  const activeConv = conversationId ? conversations.find((c) => c.id === conversationId) : undefined;

  return (
    <div className="gradient-bg h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-5xl flex flex-col flex-1 min-h-0 px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold text-theme mb-4 shrink-0">Messages</h1>

        {isLoading ? (
          <Skeleton className="flex-1 w-full" />
        ) : conversations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={<MessageSquare className="h-6 w-6" />}
              title="No conversations yet"
              description="Conversations appear here after a referral request is accepted."
              action={
                user?.role === "SEEKER" ? (
                  <Button variant="secondary" onClick={() => navigate("/seeker")}>Go to Home</Button>
                ) : (
                  <Button variant="secondary" onClick={() => navigate("/referrer")}>Browse Candidates</Button>
                )
              }
            />
          </div>
        ) : (
          <div className="flex-1 min-h-0 grid gap-4 lg:grid-cols-3">
            <GlassCard padding="sm" className="lg:col-span-1 flex flex-col min-h-0 overflow-hidden">
              <p className="text-xs font-medium text-muted uppercase tracking-wide px-2 pb-2 shrink-0">Conversations</p>
              <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
                {conversations.map((conv) => {
                  const { name, role } = getPartnerInfo(conv, user?.role);
                  const isActive = conv.id === conversationId;
                  return (
                    <Link
                      key={conv.id}
                      to={`/chat/${conv.id}`}
                      className={cn(
                        "block rounded-xl px-3 py-3 transition-colors",
                        isActive ? "nav-link-active" : "hover:bg-[var(--color-accent-muted)]"
                      )}
                    >
                      <p className="text-sm font-medium text-theme truncate">{name}</p>
                      <p className="text-xs text-muted truncate mt-0.5">{role}</p>
                    </Link>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard padding="sm" className="lg:col-span-2 flex flex-col min-h-0 overflow-hidden">
              {activeConv ? (
                <>
                  <div className="shrink-0 border-b border-theme px-4 py-3">
                    {(() => {
                      const { name, role } = getPartnerInfo(activeConv, user?.role);
                      return (
                        <>
                          <p className="font-medium text-theme">{name}</p>
                          <p className="text-xs text-muted mt-0.5">{role}</p>
                        </>
                      );
                    })()}
                  </div>
                  <ChatRoom conversationId={activeConv.id} />
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                  <MessageSquare className="h-10 w-10 text-muted/40 mb-4" />
                  <p className="text-sm font-medium text-theme">Select a conversation</p>
                  <p className="text-sm text-muted mt-1 max-w-xs">
                    Click on any conversation from the list to view and send messages.
                  </p>
                </div>
              )}
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
