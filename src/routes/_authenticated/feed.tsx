import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchFeed } from "@/lib/social";
import { PostCard, Avatar } from "@/components/post-card";
import { CalendarCard } from "@/components/CalendarCard";
import { useState } from "react";
import {
  Image as ImageIcon,
  X,
  MapPin,
  Search,
  Video,
  Music,
  Calendar as CalendarIcon,
  Newspaper,
} from "lucide-react";
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
        .select(
          "id, username, display_name, avatar_url, bio, location, status_message, visits_count",
        )
        .eq("id", userId)
        .single();
      return data;
    },
  });
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["feed", userId],
    queryFn: () => fetchFeed(userId),
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["friends", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("friendships")
        .select(
          "requester_id, addressee_id, requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url), addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, avatar_url)",
        )
        .eq("status", "accepted")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
      return (data ?? []).map((r) =>
        r.requester_id === userId ? r.addressee : r.requester,
      ) as unknown as Array<{
        id: string;
        username: string;
        display_name: string;
        avatar_url: string | null;
      }>;
    },
  });

  const { data: suggestions = [] } = useQuery({
    queryKey: ["suggestions", userId],
    queryFn: async () => {
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
        .limit(5);
      return data ?? [];
    },
  });

  return (
    <main className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)_250px] gap-6 py-6 w-full">
      {/* Sidebar izquierdo */}
      <aside className="space-y-4">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl ring-1 ring-border shadow-card overflow-hidden">
          <div className="p-4 flex gap-4 border-b border-border">
            <div className="w-16 h-16 shrink-0 rounded ring-1 ring-border bg-muted overflow-hidden">
              <Avatar profile={me} size={64} />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-bold text-[#2F5FA7] truncate text-[15px]">
                {me?.display_name || "Usuario"}
              </span>
              <Link
                to="/perfil/$username"
                params={{ username: me?.username ?? "" }}
                className="text-xs text-[#2F5FA7] hover:underline mt-0.5"
              >
                Ver mi perfil
              </Link>
            </div>
          </div>
          <div className="p-3 text-xs text-muted-foreground flex justify-around border-b border-border">
            <div className="text-center">
              <span className="block font-bold text-foreground text-sm">
                {me?.visits_count || 0}
              </span>
              visitas
            </div>
            <div className="text-center">
              <span className="block font-bold text-foreground text-sm">{friends.length}</span>
              amigos
            </div>
          </div>
          <div className="p-3 text-xs flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-online shrink-0" />
              <span className="text-foreground truncate">{me?.status_message || "En línea"}</span>
            </div>
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-left">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{me?.location || "Añadir ubicación"}</span>
            </button>
          </div>
        </div>

        {/* Amigos conectados */}
        <SidebarCard title="Amigos conectados">
          {friends.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No hay amigos en línea.</p>
          )}
          <div className="space-y-1">
            {friends.slice(0, 8).map((f) => (
              <Link
                key={f.id}
                to="/mensajes/$username"
                params={{ username: f.username }}
                className="flex items-center justify-between py-1.5 hover:bg-secondary rounded px-1.5 -mx-1.5 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar profile={f} size={24} />
                  <span className="text-[13px] text-foreground truncate">{f.display_name}</span>
                </div>
                <div className="size-2 rounded-full bg-online shrink-0" />
              </Link>
            ))}
          </div>
          {friends.length > 0 && (
            <div className="mt-3 text-right">
              <Link to="/amigos" className="text-xs font-medium text-[#2F5FA7] hover:underline">
                Ver todos
              </Link>
            </div>
          )}
        </SidebarCard>

        {/* Añadir amigos */}
        <SidebarCard title="Añadir amigos">
          {suggestions.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Sin sugerencias.</p>
          )}
          <div className="space-y-3">
            {suggestions.map((s) => (
              <SuggestionRow key={s.id} profile={s} userId={userId} />
            ))}
          </div>
          <div className="mt-4">
            <Link
              to="/amigos"
              className="flex items-center justify-center gap-2 w-full bg-[#f1f3f6] hover:bg-[#e6eaf0] text-[#1c2331] text-[13px] font-medium py-2 rounded-lg border border-[#dbe0e8] transition-colors"
            >
              <Search className="size-4" /> Buscar amigos
            </Link>
          </div>
        </SidebarCard>
      </aside>

      {/* Feed */}
      <div className="space-y-4">
        <Composer userId={userId} avatar={me} />
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-8">Cargando muro...</p>
        )}
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
        <SidebarCard
          title="SOLICITUDES"
          action={
            <span className="text-[#2F5FA7] font-normal cursor-pointer hover:underline text-xs">
              Ver todos
            </span>
          }
        >
          {pendingReqs.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-2">No tienes solicitudes pendientes.</p>
          ) : (
            <div className="space-y-3 mt-2">
              {pendingReqs.map((r) => {
                const req = r.requester as unknown as {
                  id: string;
                  username: string;
                  display_name: string;
                  avatar_url: string | null;
                };
                return <FriendRequestRow key={r.id} id={r.id} profile={req} />;
              })}
            </div>
          )}
        </SidebarCard>

        <SidebarCard
          title="EVENTOS PATROCINADOS"
          action={
            <span className="text-[#2F5FA7] font-normal cursor-pointer hover:underline text-xs">
              Ver todos
            </span>
          }
        >
          <div className="flex gap-3 mt-2">
            {/* ⚡ Bolt: added loading="lazy" to defer offscreen images */}
            <img
              src="https://images.unsplash.com/photo-1540039155732-d68a1d74ea4c?w=100&h=100&q=80"
              alt="Evento"
              loading="lazy"
              className="w-16 h-16 rounded object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-[13px] text-[#2F5FA7] leading-tight">
                Concierto Indie en Madrid
              </h5>
              <p className="text-xs text-muted-foreground mt-1">Viernes, 24 de Mayo a las 21:00</p>
              <p className="text-xs text-muted-foreground">Sala La Riviera</p>
            </div>
          </div>
          <button className="w-fit border border-[#2F5FA7] text-[#2F5FA7] font-medium text-xs px-3 py-1.5 rounded-[18px] mt-3 hover:bg-accent transition-colors block ml-auto mr-auto">
            Añadir a mi calendario
          </button>
        </SidebarCard>

        <CalendarCard userId={userId} />
      </aside>
    </main>
  );
}

function Composer({
  userId,
  avatar,
}: {
  userId: string;
  avatar: { display_name: string; avatar_url: string | null } | null | undefined;
}) {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "status" | "photo" | "video" | "music" | "event" | "news"
  >("status");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [extraData, setExtraData] = useState<Record<string, string>>({});

  const publish = useMutation({
    mutationFn: async () => {
      const text = content.trim();
      if (!text && activeTab !== "photo") throw new Error("Añade algún contenido.");

      const payload: Record<string, unknown> = {
        author_id: userId,
        content: text || (activeTab === "photo" ? "ha añadido una foto." : ""),
        type: activeTab,
      };

      if (activeTab === "photo") payload.image_url = mediaUrl.trim();
      if (activeTab === "video") payload.video_url = mediaUrl.trim();
      if (activeTab === "news") {
        payload.news_title = extraData.title;
        payload.image_url = mediaUrl.trim();
      }
      if (activeTab === "music") {
        payload.youtube_id = extraData.youtube_id;
        payload.youtube_title = extraData.youtube_title;
      }

      if (activeTab === "event") {
        const { data: evt, error: evtErr } = await supabase
          .from("events")
          .insert({
            author_id: userId,
            name: extraData.name,
            event_date: extraData.date,
            event_time: extraData.time,
            location: extraData.location,
            description: text,
          })
          .select()
          .single();
        if (evtErr) throw evtErr;
        payload.event_id = evt.id;
      }

      const { error } = await supabase.from("posts").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      setContent("");
      setMediaUrl("");
      setExtraData({});
      setActiveTab("status");
      qc.invalidateQueries({ queryKey: ["feed"] });
      toast.success("¡Publicado!");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error"),
  });

  return (
    <div className="bg-card p-4 rounded-2xl ring-1 ring-border shadow-card">
      <div className="flex gap-4 border-b border-border pb-3 mb-3 overflow-x-auto no-scrollbar">
        <ComposerTab
          icon={<Search className="size-4" />}
          label="Estado"
          active={activeTab === "status"}
          onClick={() => setActiveTab("status")}
        />
        <ComposerTab
          icon={<ImageIcon className="size-4" />}
          label="Foto"
          active={activeTab === "photo"}
          onClick={() => setActiveTab("photo")}
        />
        <ComposerTab
          icon={<Video className="size-4" />}
          label="Vídeo"
          active={activeTab === "video"}
          onClick={() => setActiveTab("video")}
        />
        <ComposerTab
          icon={<Music className="size-4" />}
          label="Música"
          active={activeTab === "music"}
          onClick={() => setActiveTab("music")}
        />
        <ComposerTab
          icon={<CalendarIcon className="size-4" />}
          label="Evento"
          active={activeTab === "event"}
          onClick={() => setActiveTab("event")}
        />
        <ComposerTab
          icon={<Newspaper className="size-4" />}
          label="Noticia"
          active={activeTab === "news"}
          onClick={() => setActiveTab("news")}
        />
      </div>

      <div className="flex gap-3">
        <Avatar profile={avatar} size={40} />
        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`¿Qué tienes en mente${avatar?.display_name ? `, ${avatar.display_name.split(" ")[0]}` : ""}?`}
            className="w-full bg-secondary rounded-xl p-3 text-sm resize-none min-h-[80px] outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />

          {activeTab === "photo" && (
            <input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="URL de la imagen..."
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          )}

          {activeTab === "video" && (
            <input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="URL del vídeo de YouTube..."
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          )}

          {activeTab === "music" && (
            <div className="space-y-2">
              <input
                value={extraData.youtube_id || ""}
                onChange={(e) => setExtraData({ ...extraData, youtube_id: e.target.value })}
                placeholder="ID del vídeo de YouTube..."
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={extraData.youtube_title || ""}
                onChange={(e) => setExtraData({ ...extraData, youtube_title: e.target.value })}
                placeholder="Título de la canción..."
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {activeTab === "event" && (
            <div className="grid grid-cols-2 gap-2">
              <input
                value={extraData.name || ""}
                onChange={(e) => setExtraData({ ...extraData, name: e.target.value })}
                placeholder="Nombre del evento"
                className="col-span-2 w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="date"
                value={extraData.date || ""}
                onChange={(e) => setExtraData({ ...extraData, date: e.target.value })}
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="time"
                value={extraData.time || ""}
                onChange={(e) => setExtraData({ ...extraData, time: e.target.value })}
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={extraData.location || ""}
                onChange={(e) => setExtraData({ ...extraData, location: e.target.value })}
                placeholder="Lugar"
                className="col-span-2 w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {activeTab === "news" && (
            <div className="space-y-2">
              <input
                value={extraData.title || ""}
                onChange={(e) => setExtraData({ ...extraData, title: e.target.value })}
                placeholder="Título de la noticia"
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="URL de la imagen (opcional)"
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-3">
        <button
          onClick={() => publish.mutate()}
          disabled={publish.isPending || (activeTab === "status" && !content.trim())}
          className="bg-[#2F5FA7] hover:bg-[#264d87] text-white text-[13px] font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-40 shadow-sm"
        >
          {publish.isPending ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </div>
  );
}

function ComposerTab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-[13px] font-medium pb-1 border-b-2 transition-colors whitespace-nowrap ${active ? "text-[#2F5FA7] border-[#2F5FA7]" : "text-muted-foreground border-transparent hover:text-foreground"}`}
    >
      {icon} {label}
    </button>
  );
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card p-3 rounded-2xl ring-1 ring-border shadow-card">
      <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
        <h4 className="text-[13px] font-bold text-foreground">{title}</h4>
        {action}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function SuggestionRow({
  profile,
  userId,
}: {
  profile: { id: string; username: string; display_name: string; avatar_url: string | null };
  userId: string;
}) {
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
      <div className="flex items-center gap-2 min-w-0">
        <Avatar profile={profile} size={32} />
        <div className="flex flex-col min-w-0">
          <Link
            to="/perfil/$username"
            params={{ username: profile.username }}
            className="text-[13px] font-medium text-[#2F5FA7] hover:underline truncate"
          >
            {profile.display_name}
          </Link>
        </div>
      </div>
      <button
        onClick={() => send.mutate()}
        disabled={send.isPending}
        className="text-[11px] font-medium bg-[#f1f3f6] border border-[#dbe0e8] hover:bg-[#e6eaf0] text-[#1c2331] px-2 py-1 rounded shrink-0 transition-colors"
      >
        Añadir
      </button>
    </div>
  );
}
