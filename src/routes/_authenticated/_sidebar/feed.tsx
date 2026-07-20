import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchFeed } from "@/lib/social";
import { PostCard, Avatar } from "@/components/post-card";
import { CalendarCard } from "@/components/CalendarCard";
import { useState, useRef, useEffect } from "react";
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
  Home,
  Flag,
  BarChart2,
  Bookmark,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Route as AuthRoute } from "../route";

export const Route = createFileRoute("/_authenticated/_sidebar/feed")({
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
          "id, username, display_name, avatar_url, bio, status_message, online_status, visits_count, location",
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

  const [statusMessage, setStatusMessage] = useState("");
  useEffect(() => {
    if (me?.status_message) setStatusMessage(me.status_message);
  }, [me?.status_message]);

  const updateStatus = useMutation({
    mutationFn: async (val: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ status_message: val })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Estado actualizado");
    },
  });

  const updateOnlineStatus = useMutation({
    mutationFn: async (val: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ online_status: val })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me", userId] });
    },
  });

  const queryClient = useQueryClient();
  return (
    <main className="flex flex-col lg:grid lg:grid-cols-[200px_minmax(0,1fr)_220px] gap-4 py-4 w-full max-w-[980px] mx-auto px-2 lg:px-0">
      {/* Sidebar izquierdo */}
      <aside className="space-y-4 hidden lg:block">
        {/* Profile Card */}
        <div className="bg-card rounded-sm border border-[#c2c9d6] overflow-hidden p-4">
          <div className="flex gap-4">
            <div className="w-[84px] h-[84px] shrink-0 rounded border border-[#c2c9d6] bg-muted overflow-hidden">
              <Avatar profile={me} size={84} />
            </div>
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <span className="font-bold text-foreground truncate text-[15px]">
                {me?.display_name || "Usuario"}
              </span>
              <span className="text-[13px] text-muted-foreground mt-0.5 mb-2 truncate">
                {me?.bio || "Vive y deja vivir."}
              </span>
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className={`size-2 rounded-full shrink-0 ${me?.online_status === "ocupado" ? "bg-red-500" : me?.online_status === "ausente" ? "bg-yellow-500" : me?.online_status === "desconectado" ? "bg-gray-400" : "bg-online"}`}
                />
                <span className="text-[13px] text-[#2F9C4A] font-medium">
                  {me?.online_status === "ocupado"
                    ? "Ocupado"
                    : me?.online_status === "ausente"
                      ? "Ausente"
                      : me?.online_status === "desconectado"
                        ? "Desconectado"
                        : "En línea"}
                </span>
              </div>
              <Link
                to="/perfil/$username"
                params={{ username: me?.username ?? "" }}
                className="text-[13px] font-bold text-[#0b439c] hover:underline"
              >
                Ver mi perfil »
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-sm border border-[#c2c9d6] p-2 flex flex-col gap-0.5">
          <Link
            to="/feed"
            className="flex items-center gap-2.5 px-3 py-2 rounded bg-secondary/80 text-[#0b439c] font-bold text-[13px]"
          >
            <Home className="size-[18px] text-[#0b439c]" /> Novedades
          </Link>
          <Link
            to="/feed"
            className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-secondary/50 text-foreground font-medium text-[13px] transition-colors justify-between"
          >
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="size-[18px] text-muted-foreground" /> Eventos
            </div>
            <span className="bg-secondary text-muted-foreground text-[11px] font-bold px-1.5 py-0.5 rounded-sm">
              2
            </span>
          </Link>
          <Link
            to="/feed"
            className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-secondary/50 text-foreground font-medium text-[13px] transition-colors"
          >
            <ImageIcon className="size-[18px] text-muted-foreground" /> Fotos
          </Link>
          <Link
            to="/feed"
            className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-secondary/50 text-foreground font-medium text-[13px] transition-colors"
          >
            <Video className="size-[18px] text-muted-foreground" /> Vídeos
          </Link>
          <Link
            to="/feed"
            className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-secondary/50 text-foreground font-medium text-[13px] transition-colors"
          >
            <Music className="size-[18px] text-muted-foreground" /> Música
          </Link>
          <Link
            to="/feed"
            className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-secondary/50 text-foreground font-medium text-[13px] transition-colors"
          >
            <Users className="size-[18px] text-muted-foreground" /> Grupos
          </Link>
          <Link
            to="/feed"
            className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-secondary/50 text-foreground font-medium text-[13px] transition-colors"
          >
            <Flag className="size-[18px] text-muted-foreground" /> Páginas
          </Link>
          <Link
            to="/feed"
            className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-secondary/50 text-foreground font-medium text-[13px] transition-colors"
          >
            <BarChart2 className="size-[18px] text-muted-foreground" /> Encuestas
          </Link>
          <Link
            to="/feed"
            className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-secondary/50 text-foreground font-medium text-[13px] transition-colors"
          >
            <Bookmark className="size-[18px] text-muted-foreground" /> Guardados
          </Link>
          <Link
            to="/feed"
            className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-secondary/50 text-foreground font-medium text-[13px] transition-colors"
          >
            <Settings className="size-[18px] text-muted-foreground" /> Configuración
          </Link>
        </div>

        {/* Escuchando ahora */}
        <SidebarCard title="ESCUCHANDO AHORA">
          <div className="flex gap-3 mt-2">
            <div className="w-16 h-16 bg-black rounded shrink-0 overflow-hidden relative group cursor-pointer">
              <img
                src="https://i.scdn.co/image/ab67616d0000b27329584b42b656cfcc8db0b7d3"
                alt="Favourite Worst Nightmare"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-[13px] text-foreground leading-tight truncate">505</h5>
              <p className="text-[12px] text-muted-foreground mt-0.5 truncate">Arctic Monkeys</p>
              <p className="text-[12px] text-muted-foreground truncate">
                Favourite Worst Nightmare
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-[11px] text-muted-foreground font-medium">1:42</span>
            <div className="h-1 flex-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-[#0b439c] rounded-full w-[40%] relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 size-2 bg-[#0b439c] rounded-full shadow" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">4:13</span>
          </div>
          <div className="mt-4 flex justify-center">
            <button className="flex items-center gap-1.5 text-[12px] font-bold text-[#0b439c] hover:underline">
              <div className="size-4 bg-[#1ED760] rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white fill-current">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.3z" />
                </svg>
              </div>
              Escuchar en Spotify
            </button>
          </div>
        </SidebarCard>

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
                  <span className="text-[13px] font-bold text-foreground truncate">
                    {f.display_name}
                  </span>
                </div>
                <div className="size-2 rounded-full bg-online shrink-0" />
              </Link>
            ))}
          </div>
          {friends.length > 0 && (
            <div className="mt-2 text-right">
              <Link to="/amigos" className="text-[13px] font-bold text-[#0b439c] hover:underline">
                Ver todos »
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
                  className="block rounded border border-[#c2c9d6] overflow-hidden"
                >
                  {s.avatar_url ? (
                    <img src={s.avatar_url} className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square bg-muted grid place-items-center text-[15px] font-bold text-[#0b439c]">
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
              className="flex items-center justify-center gap-1.5 w-full bg-card hover:bg-secondary text-[#0b439c] text-[13px] font-medium py-1.5 rounded border border-[#e5e7eb] transition-colors"
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
          <div className="bg-card p-8 rounded-sm border border-[#c2c9d6]  text-center">
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
            <span className="text-[#0b439c] font-normal cursor-pointer hover:underline text-xs">
              Ver todos
            </span>
          }
        >
          {pendingReqs.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-2">No tienes solicitudes pendientes.</p>
          ) : (
            <div className="space-y-3 mt-2">
              {pendingReqs.map((r: { id: string; requester_id: string; requester: unknown }) => {
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
            <span className="text-[#0b439c] font-normal cursor-pointer hover:underline text-xs">
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
              <h5 className="font-bold text-[13px] text-[#0b439c] leading-tight">
                Concierto Indie en Madrid
              </h5>
              <p className="text-xs text-muted-foreground mt-1">Viernes, 24 de Mayo a las 21:00</p>
              <p className="text-xs text-muted-foreground">Sala La Riviera</p>
            </div>
          </div>
          <button className="w-fit border border-[#2F5FA7] text-[#0b439c] font-medium text-xs px-3 py-1.5 rounded-[18px] mt-3 hover:bg-accent transition-colors block ml-auto mr-auto">
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
  const [activeTab, setActiveTab] = useState("status");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [extraData, setExtraData] = useState<any>({});
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
      console.error(err);
      toast.error(
        "Error al subir archivo: " + (err instanceof Error ? err.message : "Desconocido"),
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const publish = useMutation({
    mutationFn: async () => {
      const text = content.trim();
      if (!text && activeTab !== "photo" && activeTab !== "video")
        throw new Error("Añade algún contenido.");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        author_id: userId,
        content: text,
        type: activeTab,
      };

      if (activeTab === "photo") {
        if (!mediaUrl) throw new Error("Añade una URL de imagen o sube un archivo.");
        payload.image_url = mediaUrl;
      }
      if (activeTab === "video") {
        if (!extraData.video_url && !mediaUrl)
          throw new Error("Añade una URL de YouTube o sube un vídeo.");
        payload.video_url = mediaUrl || extraData.video_url;
      }
      if (activeTab === "music") {
        if (!extraData.youtube_id) throw new Error("Añade el ID de YouTube.");
        payload.youtube_id = extraData.youtube_id;
        payload.youtube_title = extraData.youtube_title;
      }
      if (activeTab === "event") {
        payload.event_name = extraData.name;
        payload.event_date = extraData.date;
        payload.event_time = extraData.time;
        payload.event_location = extraData.location;
      }
      if (activeTab === "news") {
        payload.news_title = extraData.title;
        payload.image_url = mediaUrl;
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
      toast.success("Publicado correctamente");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error al publicar"),
  });

  return (
    <div className="bg-card rounded-sm border border-[#c2c9d6]  overflow-hidden flex flex-col">
      <div className="px-4 py-3">
        <h3 className="text-[14px] font-bold text-[#0b439c]">¿Qué tienes en mente?</h3>
      </div>

      <div className="px-4 pb-4 flex gap-3 flex-col">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={activeTab === "video" ? "video/*" : "image/*"}
          onChange={handleFileUpload}
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-transparent p-0 text-[14px] resize-none min-h-[40px] outline-none placeholder:text-muted-foreground/70"
          placeholder=""
        />

        {activeTab === "photo" && (
          <div className="flex gap-2">
            <input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="URL de la imagen..."
              className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring border border-transparent"
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
              value={mediaUrl || extraData.video_url || ""}
              onChange={(e) => {
                setMediaUrl("");
                setExtraData({ ...extraData, video_url: e.target.value });
              }}
              placeholder="URL del vídeo de YouTube o archivo..."
              className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring border border-transparent"
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
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring border border-transparent"
            />
            <input
              value={extraData.youtube_title || ""}
              onChange={(e) => setExtraData({ ...extraData, youtube_title: e.target.value })}
              placeholder="Título de la canción..."
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring border border-transparent"
            />
          </div>
        )}

        {activeTab === "event" && (
          <div className="grid grid-cols-2 gap-2">
            <input
              value={extraData.name || ""}
              onChange={(e) => setExtraData({ ...extraData, name: e.target.value })}
              placeholder="Nombre del evento"
              className="col-span-2 w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring border border-transparent"
            />
            <input
              type="date"
              value={extraData.date || ""}
              onChange={(e) => setExtraData({ ...extraData, date: e.target.value })}
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring border border-transparent"
            />
            <input
              type="time"
              value={extraData.time || ""}
              onChange={(e) => setExtraData({ ...extraData, time: e.target.value })}
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring border border-transparent"
            />
            <input
              value={extraData.location || ""}
              onChange={(e) => setExtraData({ ...extraData, location: e.target.value })}
              placeholder="Lugar"
              className="col-span-2 w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring border border-transparent"
            />
          </div>
        )}

        {activeTab === "news" && (
          <div className="space-y-2">
            <input
              value={extraData.title || ""}
              onChange={(e) => setExtraData({ ...extraData, title: e.target.value })}
              placeholder="Título de la noticia"
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring border border-transparent"
            />
            <input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="URL de la imagen (opcional)"
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring border border-transparent"
            />
          </div>
        )}
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
            className="bg-[#f8f9fa] border border-[#dbe0e8] hover:bg-[#e6eaf0] text-[#0b439c] text-[13px] font-bold py-1 px-4 transition-colors disabled:opacity-40"
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
      className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors whitespace-nowrap px-2 py-1 rounded-md ${active ? "bg-white border border-[#dbe0e8] text-foreground font-bold " : "text-[#0b439c] hover:bg-black/5"}`}
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
    <section className="bg-card p-4 rounded-sm border border-[#c2c9d6] ">
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
            className="text-[13px] font-medium text-[#0b439c] hover:underline truncate"
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
            className="text-[13px] font-medium text-[#0b439c] hover:underline truncate"
          >
            {profile.display_name}
          </Link>
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => accept.mutate()}
          disabled={accept.isPending || reject.isPending}
          className="bg-[#0b439c] hover:bg-[#0b439c] text-white px-2 py-1 rounded text-[11px] font-medium transition-colors disabled:opacity-50"
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
