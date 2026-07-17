import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchFeed } from "@/lib/social";
import { PostCard, Avatar } from "@/components/post-card";
import { useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Route as AuthRoute } from "./route";

export const Route = createFileRoute("/_authenticated/feed")({
  head: () => ({ meta: [{ title: "Inicio — Inkorium" }] }),
  component: FeedPage,
});

function FeedPage() {
  const { userId } = AuthRoute.useRouteContext();
  const { data: me } = useQuery({
    queryKey: ["me", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio")
        .eq("id", userId)
        .single();
      return data;
    },
  });
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["feed", userId],
    queryFn: () => fetchFeed(userId),
  });

  const { data: pendingReqs = [] } = useQuery({
    queryKey: ["friendship-requests", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("friendships")
        .select("id, requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url)")
        .eq("addressee_id", userId)
        .eq("status", "pending")
        .limit(5);
      return data ?? [];
    },
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["friends", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("friendships")
        .select("requester_id, addressee_id, requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url), addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, avatar_url)")
        .eq("status", "accepted")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .limit(8);
      return (data ?? []).map((r) => {
        const other = r.requester_id === userId ? r.addressee : r.requester;
        return other as unknown as { id: string; username: string; display_name: string; avatar_url: string | null };
      });
    },
  });

  const { data: suggestions = [] } = useQuery({
    queryKey: ["suggestions", userId],
    queryFn: async () => {
      // people who aren't me and aren't already in a friendship with me
      const { data: existing } = await supabase
        .from("friendships")
        .select("requester_id, addressee_id")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
      const excluded = new Set<string>([userId]);
      existing?.forEach((r) => {
        excluded.add(r.requester_id);
        excluded.add(r.addressee_id);
      });
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .not("id", "in", `(${Array.from(excluded).join(",")})`)
        .limit(3);
      return data ?? [];
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] gap-6">
      {/* Sidebar izquierdo */}
      <aside className="space-y-4 hidden lg:block">
        <div className="bg-card p-4 rounded-2xl ring-1 ring-border shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <Avatar profile={me} size={48} />
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{me?.display_name}</p>
              {me && (
                <Link
                  to="/perfil/$username"
                  params={{ username: me.username }}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                >
                  Ver mi perfil
                </Link>
              )}
            </div>
          </div>
          <nav className="space-y-1 text-sm">
            <Link to="/feed" className="flex px-2 py-1.5 rounded-lg font-medium text-primary bg-accent">
              Inicio
            </Link>
            <Link to="/amigos" className="flex px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
              Amigos
            </Link>
            <Link to="/mensajes" className="flex px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
              Mensajes
            </Link>
          </nav>
        </div>
      </aside>

      {/* Feed */}
      <div className="space-y-4">
        <Composer userId={userId} avatar={me} />
        {isLoading && <p className="text-sm text-muted-foreground text-center py-8">Cargando muro...</p>}
        {!isLoading && posts.length === 0 && (
          <div className="bg-card p-8 rounded-2xl ring-1 ring-border text-center">
            <p className="text-sm text-muted-foreground">
              Aún no hay nada por aquí. ¡Publica lo primero!
            </p>
          </div>
        )}
        {posts.map((p) => (
          <PostCard key={p.id} post={p} currentUserId={userId} />
        ))}
      </div>

      {/* Sidebar derecho */}
      <aside className="space-y-4 hidden lg:block">
        <SidebarCard title="Solicitudes">
          {pendingReqs.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Sin solicitudes nuevas.</p>
          )}
          {pendingReqs.map((r) => {
            const req = r.requester as unknown as { id: string; username: string; display_name: string; avatar_url: string | null };
            return <FriendRequestRow key={r.id} id={r.id} profile={req} />;
          })}
        </SidebarCard>

        <SidebarCard title="Amigos" badge={friends.length}>
          {friends.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Añade amigos para verlos aquí.</p>
          )}
          {friends.map((f) => (
            <Link
              key={f.id}
              to="/mensajes/$username"
              params={{ username: f.username }}
              className="flex items-center gap-3 py-1 hover:bg-secondary rounded-lg px-1 -mx-1 transition-colors"
            >
              <div className="relative">
                <Avatar profile={f} size={32} />
                <span className="absolute bottom-0 right-0 size-2.5 bg-[color:var(--online)] rounded-full ring-2 ring-card" />
              </div>
              <span className="text-sm text-foreground truncate">{f.display_name}</span>
            </Link>
          ))}
        </SidebarCard>

        <SidebarCard title="Gente que podrías conocer">
          {suggestions.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Sin sugerencias por ahora.</p>
          )}
          {suggestions.map((s) => (
            <SuggestionRow key={s.id} profile={s} userId={userId} />
          ))}
        </SidebarCard>
      </aside>
    </main>
  );
}

function Composer({ userId, avatar }: { userId: string; avatar: { display_name: string; avatar_url: string | null } | null | undefined }) {
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImage, setShowImage] = useState(false);

  const publish = useMutation({
    mutationFn: async () => {
      const text = content.trim();
      if (!text) throw new Error("Escribe algo antes de publicar.");
      const { error } = await supabase.from("posts").insert({
        author_id: userId,
        content: text,
        image_url: imageUrl.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setContent("");
      setImageUrl("");
      setShowImage(false);
      qc.invalidateQueries({ queryKey: ["feed"] });
      toast.success("¡Publicado!");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error"),
  });

  return (
    <div className="bg-card p-4 rounded-2xl ring-1 ring-border shadow-card">
      <div className="flex gap-3">
        <Avatar profile={avatar} size={40} />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`¿Qué tienes en mente${avatar?.display_name ? `, ${avatar.display_name.split(" ")[0]}` : ""}?`}
          className="w-full bg-secondary rounded-xl p-3 text-sm resize-none min-h-[80px] outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
      </div>
      {showImage && (
        <div className="mt-3 flex gap-2 items-center">
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Pega una URL de imagen..."
            className="flex-1 bg-secondary rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => {
              setImageUrl("");
              setShowImage(false);
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
        <button
          onClick={() => setShowImage((v) => !v)}
          className="flex items-center gap-1.5 p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors text-xs font-medium"
        >
          <ImageIcon className="size-4" /> Añadir imagen
        </button>
        <button
          onClick={() => publish.mutate()}
          disabled={!content.trim() || publish.isPending}
          className="bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium py-1.5 px-4 rounded-lg transition-colors disabled:opacity-40"
        >
          {publish.isPending ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </div>
  );
}

function SidebarCard({ title, badge, children }: { title: string; badge?: number; children: React.ReactNode }) {
  return (
    <section className="bg-card p-4 rounded-2xl ring-1 ring-border shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h4>
        {typeof badge === "number" && badge > 0 && (
          <span className="text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full font-medium">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function FriendRequestRow({ id, profile }: { id: string; profile: { id: string; username: string; display_name: string; avatar_url: string | null } }) {
  const qc = useQueryClient();
  const respond = useMutation({
    mutationFn: async (accept: boolean) => {
      if (accept) {
        await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
      } else {
        await supabase.from("friendships").delete().eq("id", id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friendship-requests"] });
      qc.invalidateQueries({ queryKey: ["friendships-pending-count"] });
      qc.invalidateQueries({ queryKey: ["friends"] });
    },
  });
  return (
    <div className="flex items-center justify-between gap-2">
      <Link
        to="/perfil/$username"
        params={{ username: profile.username }}
        className="flex items-center gap-2 min-w-0 hover:underline"
      >
        <Avatar profile={profile} size={32} />
        <span className="text-sm font-medium truncate">{profile.display_name}</span>
      </Link>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => respond.mutate(true)}
          className="text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-1 rounded-md hover:bg-primary-hover"
        >
          OK
        </button>
        <button
          onClick={() => respond.mutate(false)}
          className="text-[10px] font-semibold uppercase tracking-wider bg-secondary text-secondary-foreground px-2 py-1 rounded-md hover:bg-muted"
        >
          No
        </button>
      </div>
    </div>
  );
}

function SuggestionRow({ profile, userId }: { profile: { id: string; username: string; display_name: string; avatar_url: string | null }; userId: string }) {
  const qc = useQueryClient();
  const send = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("friendships")
        .insert({ requester_id: userId, addressee_id: profile.id, status: "pending" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Solicitud enviada");
      qc.invalidateQueries({ queryKey: ["suggestions"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  return (
    <div className="flex items-center justify-between gap-2">
      <Link
        to="/perfil/$username"
        params={{ username: profile.username }}
        className="flex items-center gap-2 min-w-0 hover:underline"
      >
        <Avatar profile={profile} size={32} />
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-medium leading-none truncate">{profile.display_name}</span>
          <span className="text-[11px] text-muted-foreground">@{profile.username}</span>
        </div>
      </Link>
      <button
        onClick={() => send.mutate()}
        disabled={send.isPending}
        className="text-[11px] font-medium bg-secondary hover:bg-muted text-secondary-foreground px-2 py-1 rounded-md shrink-0"
      >
        + Añadir
      </button>
    </div>
  );
}
