import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Route as AuthRoute } from "./route";
import { Avatar } from "@/components/post-card";
import { timeAgo } from "@/lib/social";

export const Route = createFileRoute("/_authenticated/mensajes")({
  head: () => ({ meta: [{ title: "Mensajes — Inkorium" }] }),
  component: MessagesLayout,
});

function MessagesLayout() {
  const { userId } = AuthRoute.useRouteContext();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data: threads = [] } = useQuery({
    queryKey: ["threads", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select(
          "id, content, created_at, read_at, sender_id, recipient_id, sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url), recipient:profiles!messages_recipient_id_fkey(id, username, display_name, avatar_url)",
        )
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(200);

      const seen = new Map<
        string,
        {
          other: { id: string; username: string; display_name: string; avatar_url: string | null };
          last: string;
          created_at: string;
          unread: boolean;
        }
      >();
      (data ?? []).forEach((m) => {
        const other = (m.sender_id === userId ? m.recipient : m.sender) as unknown as {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
        };
        if (seen.has(other.id)) return;
        seen.set(other.id, {
          other,
          last: m.content,
          created_at: m.created_at,
          unread: m.recipient_id === userId && !m.read_at,
        });
      });
      return Array.from(seen.values());
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("threads")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () =>
        qc.invalidateQueries({ queryKey: ["threads", userId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, qc]);

  const showListOnMobile = pathname === "/mensajes";

  return (
    <main className="w-full py-4">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 bg-card border border-[#c2c9d6] rounded-sm shadow-none overflow-hidden min-h-[70vh]">
        <aside
          className={`border-r border-border ${showListOnMobile ? "block" : "hidden md:block"}`}
        >
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Conversaciones
            </h2>
          </div>
          <div className="divide-y divide-border">
            {threads.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground italic">
                Aún no tienes mensajes. Escribe a un amigo desde su perfil.
              </p>
            )}
            {threads.map((t) => {
              const active = pathname === `/mensajes/${t.other.username}`;
              return (
                <Link
                  key={t.other.id}
                  to="/mensajes/$username"
                  params={{ username: t.other.username }}
                  className={`flex items-center gap-3 p-3 hover:bg-secondary transition-colors ${
                    active ? "bg-accent" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar profile={t.other} size={40} />
                    {t.unread && (
                      <span className="absolute -top-0.5 -right-0.5 size-2.5 bg-primary rounded-full ring-2 ring-card" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm truncate ${t.unread ? "font-semibold" : "font-medium"}`}
                      >
                        {t.other.display_name}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {timeAgo(t.created_at)}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate ${t.unread ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {t.last}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>

        <section className={`${showListOnMobile ? "hidden md:block" : "block"}`}>
          {showListOnMobile ? (
            <div className="h-full grid place-items-center p-8 text-center text-sm text-muted-foreground">
              Elige una conversación de la izquierda para empezar a charlar.
            </div>
          ) : (
            <Outlet />
          )}
        </section>
      </div>
    </main>
  );
}
