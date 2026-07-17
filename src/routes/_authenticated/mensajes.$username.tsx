import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Route as AuthRoute } from "./route";
import { Avatar } from "@/components/post-card";
import { ArrowLeft, Send } from "lucide-react";
import { timeAgo } from "@/lib/social";

export const Route = createFileRoute("/_authenticated/mensajes/$username")({
  head: ({ params }) => ({ meta: [{ title: `Chat con ${params.username} — Inkorium` }] }),
  component: ConversationPage,
});

function ConversationPage() {
  const { username } = Route.useParams();
  const { userId } = AuthRoute.useRouteContext();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: other } = useQuery({
    queryKey: ["profile-by-username", username],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .eq("username", username)
        .maybeSingle();
      return data;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["conv", userId, other?.id],
    enabled: !!other,
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, content, created_at, sender_id, recipient_id, read_at")
        .or(
          `and(sender_id.eq.${userId},recipient_id.eq.${other!.id}),and(sender_id.eq.${other!.id},recipient_id.eq.${userId})`,
        )
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  // Mark as read
  useEffect(() => {
    if (!other || messages.length === 0) return;
    const unreadIds = messages
      .filter((m) => m.recipient_id === userId && !m.read_at)
      .map((m) => m.id);
    if (unreadIds.length === 0) return;
    supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds)
      .then(() => {
        qc.invalidateQueries({ queryKey: ["messages-unread-count"] });
        qc.invalidateQueries({ queryKey: ["threads"] });
      });
  }, [messages, other, userId, qc]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  // Realtime new messages in this conversation
  useEffect(() => {
    if (!other) return;
    const channel = supabase
      .channel(`conv-${userId}-${other.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as { sender_id: string; recipient_id: string };
          if (
            (m.sender_id === userId && m.recipient_id === other.id) ||
            (m.sender_id === other.id && m.recipient_id === userId)
          ) {
            qc.invalidateQueries({ queryKey: ["conv", userId, other.id] });
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, other, qc]);

  const send = useMutation({
    mutationFn: async () => {
      const content = text.trim();
      if (!content || !other) return;
      const { error } = await supabase
        .from("messages")
        .insert({ sender_id: userId, recipient_id: other.id, content });
      if (error) throw error;
    },
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["conv", userId, other?.id] });
      qc.invalidateQueries({ queryKey: ["threads"] });
    },
  });

  if (!other) {
    return <div className="p-8 text-sm text-muted-foreground">Usuario no encontrado.</div>;
  }

  return (
    <div className="flex flex-col h-full min-h-[70vh]">
      <header className="flex items-center gap-3 p-4 border-b border-border">
        <Link
          to="/mensajes"
          className="md:hidden p-1.5 -ml-1 rounded-md hover:bg-secondary text-muted-foreground"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <Link
          to="/perfil/$username"
          params={{ username: other.username }}
          className="flex items-center gap-3 hover:underline min-w-0"
        >
          <Avatar profile={other} size={36} />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{other.display_name}</p>
            <p className="text-xs text-muted-foreground truncate">@{other.username}</p>
          </div>
        </Link>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-secondary/30">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground italic py-8">
            Rompe el hielo con {other.display_name}.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-surface ring-1 ring-border rounded-bl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                <p className={`text-[10px] mt-0.5 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {timeAgo(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send.mutate();
        }}
        className="flex gap-2 p-3 border-t border-border bg-card"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={!text.trim() || send.isPending}
          className="bg-primary hover:bg-primary-hover text-primary-foreground p-2.5 rounded-full disabled:opacity-40 transition-colors"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
