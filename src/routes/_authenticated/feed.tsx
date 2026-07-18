import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchFeed } from "@/lib/social";
import { PostCard, Avatar } from "@/components/post-card";
import { CalendarCard } from "@/components/CalendarCard";
import { useState, useRef } from "react";
import {
  Image as ImageIcon,
  X,
  MapPin,
  Search,
  Video,
  Upload,
  Music,
  Calendar as CalendarIcon,
  Newspaper,
  Users,
  ChevronDown,
  ArrowRight,
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

  const { data: pendingReqs = [] } = useQuery({
    queryKey: ["pendingRequests", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("friendships")
        .select(
          "id, requester_id, requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url)",
        )
        .eq("addressee_id", userId)
        .eq("status", "pending");
      return data ?? [];
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
        <div className="bg-card rounded-xl ring-1 ring-border shadow-sm overflow-hidden">
          <div className="p-4 flex gap-4">
            <div className="w-[64px] h-[64px] shrink-0 rounded ring-1 ring-border bg-muted overflow-hidden">
              <Avatar profile={me} size={64} />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-bold text-foreground truncate text-[15px]">
                {me?.display_name || "Usuario"}
              </span>
              <Link
                to="/perfil/$username"
                params={{ username: me?.username ?? "" }}
                className="text-[13px] text-[#2F5FA7] hover:underline mt-0.5"
              >
                Ver mi perfil
              </Link>
              <div className="text-[11px] text-muted-foreground mt-2 font-medium">
                <span className="font-bold text-foreground">1.842</span> visitas a tu perfil
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 font-medium">
                <Users className="size-3.5" />
                <span>
                  <span className="font-bold text-foreground">{friends.length}</span> amigos
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-border p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 cursor-pointer w-fit group">
              <div className="size-2 rounded-full bg-online shrink-0" />
              <span className="text-[13px] text-muted-foreground font-medium flex items-center gap-1 group-hover:text-foreground transition-colors">
                En línea <ChevronDown className="size-3" />
              </span>
            </div>
            <input
              type="text"
              placeholder="¿Qué estás haciendo?"
              className="w-full bg-secondary rounded px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-ring border border-border/50 placeholder:text-muted-foreground/70"
            />
            <button className="flex items-center gap-1.5 text-[#2F5FA7] hover:underline text-left font-medium text-[13px]">
              <MapPin className="size-4 shrink-0" />
              <span className="truncate">Añadir ubicación</span>
            </button>
          </div>
        </div>

        {/* Amigos conectados */}
        <SidebarCard title={`AMIGOS CONECTADOS (${friends.length})`}>
          {friends.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No hay amigos en línea.</p>
          )}
          <div className="space-y-0.5">
            {friends.slice(0, 8).map((f) => (
              <Link
                key={f.id}
                to="/mensajes/$username"
                params={{ username: f.username }}
                className="flex items-center justify-between py-1.5 hover:bg-secondary rounded px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar profile={f} size={28} />
                  <span className="text-[13px] font-medium text-foreground truncate">
                    {f.display_name}
                  </span>
                </div>
                <div className="size-2 rounded-full bg-online shrink-0" />
              </Link>
            ))}
          </div>
          {friends.length > 0 && (
            <div className="mt-2 text-right">
              <Link
                to="/amigos"
                className="text-[13px] font-medium text-[#2F5FA7] hover:underline flex items-center justify-end gap-1"
              >
                Ver todos <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}
        </SidebarCard>

        {/* Añadir amigos */}
        <SidebarCard title="AÑADIR AMIGOS">
          <p className="text-[13px] text-muted-foreground mb-3">
            Encuentra a tus amigos en Inkorium
          </p>
          {suggestions.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Sin sugerencias.</p>
          )}
          {suggestions.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {suggestions.slice(0, 4).map((s) => (
                <Link
                  key={s.id}
                  to="/perfil/$username"
                  params={{ username: s.username }}
                  className="block rounded ring-1 ring-border overflow-hidden"
                >
                  {s.avatar_url ? (
                    <img src={s.avatar_url} className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square bg-muted grid place-items-center text-[15px] font-bold text-[#2F5FA7]">
                      {s.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
          <div className="mt-1">
            <Link
              to="/amigos"
              className="flex items-center justify-center gap-1.5 w-full bg-card hover:bg-secondary text-[#2F5FA7] text-[13px] font-medium py-1.5 rounded border border-[#e5e7eb] transition-colors"
            >
              Buscar amigos <ArrowRight className="size-3.5" />
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
          <div className="bg-card p-8 rounded-xl ring-1 ring-border shadow-sm text-center">
            <p className="text-sm text-muted-foreground">
              Aún no hay nada por aquí. ¡Publica lo primero!
            </p>
          </div>
        )}
        <div className="flex flex-col gap-6">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} currentUserId={userId} />
          ))}
        </div>
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
              {pendingReqs.map((r: any) => {
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
            <img
              src="https://images.unsplash.com/photo-1540039155732-d68a1d74ea4c?w=100&h=100&q=80"
              alt="Evento"
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const ext = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from("media")
        .upload(`posts/${fileName}`, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("media")
        .getPublicUrl(`posts/${fileName}`);

      setMediaUrl(publicUrlData.publicUrl);
      toast.success("Archivo subido correctamente");
    } catch (err) {
      toast.error("Error al subir archivo");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const publish = useMutation({
    mutationFn: async () => {
      const text = content.trim();
      if (!text && activeTab !== "photo") throw new Error("Añade algún contenido.");

      const payload: Record<string, unknown> = {
        author_id: userId,
        content: text || (activeTab === "photo" ? "ha añadido una foto." : ""),
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

      const { error } = await supabase.from("posts").insert(payload as never);
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
    <div className="bg-card ring-1 ring-border shadow-sm flex flex-col rounded-xl overflow-hidden">
      <div className="p-3">
        <h3 className="text-[13px] font-bold text-[#2F5FA7] mb-2">¿Qué tienes en mente?</h3>
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*"
            onChange={handleFileUpload}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent p-0 text-[14px] resize-none min-h-[40px] outline-none placeholder:text-muted-foreground/70"
          />

          {activeTab === "photo" && (
            <div className="flex gap-2">
              <input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="URL de la imagen..."
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-border disabled:opacity-50"
              >
                <Upload className="size-4" />
                {isUploading ? "Subiendo..." : "Subir"}
              </button>
            </div>
          )}

          {activeTab === "video" && (
            <div className="flex gap-2">
              <input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="URL del vídeo de YouTube..."
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-border disabled:opacity-50"
              >
                <Upload className="size-4" />
                {isUploading ? "Subiendo..." : "Subir"}
              </button>
            </div>
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

      <div className="bg-[#f1f3f6] border-t border-[#dbe0e8] px-3 py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex gap-4 overflow-x-auto no-scrollbar items-center">
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
            icon={<Music className="size-4" />}
            label="Música"
            active={activeTab === "music"}
            onClick={() => setActiveTab("music")}
          />
          <ComposerTab
            icon={<Video className="size-4" />}
            label="Vídeo"
            active={activeTab === "video"}
            onClick={() => setActiveTab("video")}
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

        <div className="flex justify-end shrink-0">
          <button
            onClick={() => publish.mutate()}
            disabled={publish.isPending || (activeTab === "status" && !content.trim())}
            className="bg-[#f8f9fa] border border-[#dbe0e8] hover:bg-[#e6eaf0] text-[#2F5FA7] text-[13px] font-bold py-1 px-4 transition-colors disabled:opacity-40"
          >
            {publish.isPending ? "Publicando..." : "Publicar"}
          </button>
        </div>
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
      className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors whitespace-nowrap px-2 py-1 rounded-md ${active ? "bg-white border border-[#dbe0e8] text-foreground font-bold shadow-sm" : "text-[#2F5FA7] hover:bg-black/5"}`}
    >
      {icon} {label}
    </button>
  );
}

function SidebarCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card p-4 rounded-xl ring-1 ring-border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          {title}
        </h4>
        {action}
      </div>
      <div>{children}</div>
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

function FriendRequestRow({
  id,
  profile,
}: {
  id: string;
  profile: { id: string; username: string; display_name: string; avatar_url: string | null };
}) {
  const qc = useQueryClient();
  const accept = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingRequests"] });
      qc.invalidateQueries({ queryKey: ["friends"] });
      toast.success("Solicitud aceptada");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });
  const reject = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("friendships").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingRequests"] });
      toast.success("Solicitud rechazada");
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
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => accept.mutate()}
          disabled={accept.isPending || reject.isPending}
          className="bg-[#2F5FA7] hover:bg-[#264d87] text-white px-2 py-1 rounded text-[11px] font-medium transition-colors disabled:opacity-50"
        >
          Aceptar
        </button>
        <button
          onClick={() => reject.mutate()}
          disabled={accept.isPending || reject.isPending}
          className="bg-muted hover:bg-muted/80 text-foreground px-2 py-1 rounded text-[11px] font-medium transition-colors disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>
    </div>
  );
}
