import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchFeed } from "@/lib/social";
import { PostCard, Avatar } from "@/components/post-card";
import { CalendarCard } from "@/components/CalendarCard";
import { useState, useRef, useEffect } from "react";
import {
  ArrowRight,
  BarChart2,
  Bookmark,
  Calendar as CalendarIcon,
  ChevronDown,
  Flag,
  Globe2,
  Home,
  Image as ImageIcon,
  MapPin,
  Music,
  Newspaper,
  Search,
  Settings,
  Upload,
  Users,
  Video,
  X,
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
    <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_220px] gap-4 w-full">
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
    </div>
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

      const finalType = ["poll", "album", "playlist", "location", "celebration"].includes(activeTab)
        ? "status"
        : activeTab;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        author_id: userId,
        content: text,
        type: finalType,
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

  const firstName = avatar?.display_name?.split(" ")[0] || "usuario";

  return (
    <div className="bg-white rounded-md border border-[#dbe0e8] flex flex-col p-4 shadow-sm">
      {/* Row 1: Cabecera con avatar y caja de texto */}
      <div className="flex gap-3 items-start mb-4">
        {avatar?.avatar_url ? (
          <img
            src={avatar.avatar_url}
            alt="Avatar"
            className="w-12 h-12 rounded-lg object-cover border border-[#e6eaf0]"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-[#e6eaf0] flex items-center justify-center shrink-0 border border-[#dbe0e8]">
            <span className="text-[#0b439c] text-lg font-bold">
              {avatar?.display_name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 border border-[#dbe0e8] rounded-md p-3 focus-within:border-[#0b439c] focus-within:ring-1 focus-within:ring-[#0b439c]/20 transition-all bg-white flex flex-col">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent p-0 text-[15px] resize-none h-[24px] outline-none placeholder:text-muted-foreground"
            placeholder={`¿Qué estás pensando, ${firstName.toLowerCase()}?`}
          />

          {/* Opciones extra dinámicas */}
          <div className="space-y-2 mt-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept={activeTab === "video" ? "video/*" : "image/*"}
              onChange={handleFileUpload}
            />

            {activeTab === "photo" && (
              <div className="flex gap-2">
                <input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="URL de la imagen..."
                  className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none border border-border"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-secondary text-foreground px-3 py-2 rounded-lg text-sm font-medium border border-border disabled:opacity-50"
                >
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
                  placeholder="URL del vídeo o subir archivo..."
                  className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none border border-border"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-secondary text-foreground px-3 py-2 rounded-lg text-sm font-medium border border-border disabled:opacity-50"
                >
                  {isUploading ? "Subiendo..." : "Subir"}
                </button>
              </div>
            )}

            {activeTab === "music" && (
              <div className="flex gap-2">
                <input
                  value={extraData.youtube_id || ""}
                  onChange={(e) => setExtraData({ ...extraData, youtube_id: e.target.value })}
                  placeholder="ID YouTube..."
                  className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none border border-border"
                />
              </div>
            )}

            {activeTab === "event" && (
              <div className="flex gap-2">
                <input
                  value={extraData.name || ""}
                  onChange={(e) => setExtraData({ ...extraData, name: e.target.value })}
                  placeholder="Nombre del evento"
                  className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none border border-border"
                />
              </div>
            )}

            {activeTab === "poll" && (
              <div className="text-xs text-muted-foreground mt-2">
                Configura tu encuesta (Placeholder)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Barra de herramientas (Compacta y sin scroll) */}
      <div className="flex items-center overflow-hidden whitespace-nowrap mb-4">
        <div className="flex gap-1 md:gap-[18px] items-center flex-shrink min-w-0 flex-nowrap w-full overflow-hidden">
          <ComposerTab
            icon={<Search className="w-4 h-4" />}
            label="Estado"
            active={activeTab === "status"}
            onClick={() => setActiveTab("status")}
          />
          <ComposerTab
            icon={<ImageIcon className="w-4 h-4" />}
            label="Foto"
            active={activeTab === "photo"}
            onClick={() => setActiveTab("photo")}
          />
          <ComposerTab
            icon={<Video className="w-4 h-4" />}
            label="Vídeo"
            active={activeTab === "video"}
            onClick={() => setActiveTab("video")}
          />
          <ComposerTab
            icon={<Music className="w-4 h-4" />}
            label="Música"
            active={activeTab === "music"}
            onClick={() => setActiveTab("music")}
          />
          <ComposerTab
            icon={<CalendarIcon className="w-4 h-4" />}
            label="Evento"
            active={activeTab === "event"}
            onClick={() => setActiveTab("event")}
          />
          <ComposerTab
            icon={<BarChart2 className="w-4 h-4" />}
            label="Encuesta"
            active={activeTab === "poll"}
            onClick={() => setActiveTab("poll")}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-[6px] text-[14px] transition-colors px-1 py-1 rounded-sm outline-none flex-shrink-0 ${["news", "album", "playlist", "location", "celebration"].includes(activeTab) ? "font-bold text-foreground" : "text-black hover:bg-black/5"}`}
              >
                <BarChart2 className="w-4 h-4 rotate-90" />
                Más
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-40 p-1 bg-white rounded-sm border border-[#c2c9d6] shadow-md !animate-none"
            >
              <DropdownMenuItem
                onClick={() => setActiveTab("news")}
                className={`text-[12px] px-2 py-1.5 rounded-sm cursor-pointer ${activeTab === "news" ? "bg-accent text-accent-foreground font-medium" : ""}`}
              >
                <Newspaper className="w-3.5 h-3.5 mr-2" />
                Noticia
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveTab("album")}
                className={`text-[12px] px-2 py-1.5 rounded-sm cursor-pointer ${activeTab === "album" ? "bg-accent text-accent-foreground font-medium" : ""}`}
              >
                <ImageIcon className="w-3.5 h-3.5 mr-2" />
                Álbum
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveTab("playlist")}
                className={`text-[12px] px-2 py-1.5 rounded-sm cursor-pointer ${activeTab === "playlist" ? "bg-accent text-accent-foreground font-medium" : ""}`}
              >
                <Music className="w-3.5 h-3.5 mr-2" />
                Playlist
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveTab("location")}
                className={`text-[12px] px-2 py-1.5 rounded-sm cursor-pointer ${activeTab === "location" ? "bg-accent text-accent-foreground font-medium" : ""}`}
              >
                <MapPin className="w-3.5 h-3.5 mr-2" />
                Ubicación
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveTab("celebration")}
                className={`text-[12px] px-2 py-1.5 rounded-sm cursor-pointer ${activeTab === "celebration" ? "bg-accent text-accent-foreground font-medium" : ""}`}
              >
                <Flag className="w-3.5 h-3.5 mr-2" />
                Celebración
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Row 3: Footer */}
      <div className="border-t border-[#e6eaf0] pt-4 flex justify-end items-center gap-4">
        <button className="flex items-center gap-1.5 text-[14px] text-black font-medium hover:text-foreground transition-colors">
          <Globe2 className="w-[18px] h-[18px]" />
          Público
          <ChevronDown className="w-4 h-4 ml-[-2px]" />
        </button>

        <button
          onClick={() => publish.mutate()}
          disabled={publish.isPending || (activeTab === "status" && !content.trim())}
          className="bg-[#1b53c0] hover:bg-[#154299] text-white text-[14px] font-medium py-1.5 px-6 rounded-md transition-colors disabled:opacity-50"
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
      className={`flex items-center gap-[6px] text-[14px] transition-colors px-1 py-1 rounded-sm flex-shrink-0 ${active ? "font-bold text-foreground" : "text-black hover:bg-black/5"}`}
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
