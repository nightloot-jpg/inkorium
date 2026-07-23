import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchFeed, initials } from "@/lib/social";
import { PostCard, Avatar } from "@/components/post-card";
import { Route as AuthRoute } from "./route";
import { useState, useEffect, useRef } from "react";
import {
  UserPlus,
  MessageCircle,
  Check,
  X,
  Pencil,
  MoreHorizontal,
  Calendar,
  Users,
  Eye,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Link as LinkIcon,
  Music,
  Play,
  Image as ImageIcon,
  Video,
  ChevronDown,
  Activity,
  Settings,
  Quote,
  Cake,
  Globe,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { ListeningWidget } from "@/components/ListeningWidget";
import { TrackData } from "@/lib/music/types";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

export const Route = createFileRoute("/_authenticated/perfil/$username")({
  head: ({ params }) => ({ meta: [{ title: `${params.username} — Inkorium` }] }),
  component: ProfilePage,
  notFoundComponent: () => (
    <div className="max-w-2xl mx-auto text-center py-24">
      <h2 className="text-xl font-semibold">Usuario no encontrado</h2>
      <p className="text-sm text-muted-foreground mt-2">Ese perfil no existe.</p>
    </div>
  ),
});

function ProfilePage() {
  const { username } = Route.useParams();
  const { userId } = AuthRoute.useRouteContext();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, bio, avatar_url, cover_url, created_at, location, visits_count, status_message, age",
        )
        .eq("username", username)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return data;
    },
  });

  useEffect(() => {
    if (profile && profile.id !== userId) {
      // Increment visit count for the profile
      (supabase.rpc as unknown as { (rpc: string, args: unknown): Promise<{ error: unknown }> })(
        "record_visit",
        { p_profile_id: profile.id, p_visitor_id: userId },
      ).then(({ error }) => {
        if (error) console.error("Error recording view:", error);
      });
    }
  }, [profile, profile?.id, userId]);

  const isMe = profile?.id === userId;

  const { data: latestMusicPost } = useQuery({
    queryKey: ["latestMusic", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", profile!.id)
        .eq("type", "music")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const musicTrack: TrackData | undefined = latestMusicPost
    ? {
        provider:
          ((latestMusicPost.metadata as Record<string, string>)?.provider as
            "YouTube" | "Spotify" | "Deezer" | "SoundCloud") || "YouTube",
        videoId: latestMusicPost.youtube_id || "",
        url:
          (latestMusicPost.metadata as Record<string, string>)?.url ||
          `https://youtube.com/watch?v=${latestMusicPost.youtube_id}`,
        title: latestMusicPost.youtube_title || "",
        artist: latestMusicPost.youtube_channel || "",
        album: (latestMusicPost.metadata as Record<string, string>)?.album,
        cover:
          (latestMusicPost.metadata as Record<string, string>)?.cover ||
          `https://i.ytimg.com/vi/${latestMusicPost.youtube_id}/maxresdefault.jpg`,
        duration: latestMusicPost.youtube_duration || "0:00",
        year: (latestMusicPost.metadata as Record<string, string>)?.year,
      }
    : undefined;

  const { data: feed = [] } = useQuery({
    queryKey: ["profile-posts", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const all = await fetchFeed(userId);
      return all.filter((p) => p.author.id === profile!.id);
    },
  });

  const { data: recentVisitors = [] } = useQuery({
    queryKey: ["profile_visitors", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_visits")
        .select(
          "visited_at, visitor:profiles!profile_visits_visitor_id_fkey(username, display_name)",
        )
        .eq("profile_id", profile!.id)
        .order("visited_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: friendship } = useQuery({
    queryKey: ["friendship", userId, profile?.id],
    enabled: !!profile && !isMe,
    queryFn: async () => {
      const { data } = await supabase
        .from("friendships")
        .select("id, status, requester_id, addressee_id")
        .or(
          `and(requester_id.eq.${userId},addressee_id.eq.${profile!.id}),and(requester_id.eq.${profile!.id},addressee_id.eq.${userId})`,
        )
        .maybeSingle();
      return data;
    },
  });

  const sendReq = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("friendships")
        .insert({ requester_id: userId, addressee_id: profile!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Solicitud enviada");
      qc.invalidateQueries({ queryKey: ["friendship", userId, profile?.id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const acceptReq = useMutation({
    mutationFn: async () => {
      await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendship!.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friendship"] });
      qc.invalidateQueries({ queryKey: ["friendships-pending-count"] });
      qc.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const removeReq = useMutation({
    mutationFn: async () => {
      await supabase.from("friendships").delete().eq("id", friendship!.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friendship"] });
      qc.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const [activeTab, setActiveTab] = useState("Tablón");

  if (isLoading)
    return <p className="text-center py-16 text-sm text-muted-foreground">Cargando...</p>;
  if (!profile) return null;

  return (
    <main className="flex flex-col lg:grid lg:grid-cols-[340px_minmax(500px,1fr)_330px] lg:justify-center gap-[30px] py-4 w-full">
      {/* LEFT COLUMN */}
      <div className="space-y-4 hidden lg:block">
        {/* Profile Card */}
        <div className="bg-card rounded-md border border-[#c2c9d6]  overflow-hidden">
          <CoverImage
            currentUserId={userId}
            isMe={isMe}
            profile={
              profile as unknown as {
                id: string;
                display_name: string;
                avatar_url: string | null;
                cover_url: string | null;
                status_message: string | null;
              }
            }
          />
          <div className="px-4 pb-4 relative">
            <AvatarImage
              currentUserId={userId}
              isMe={isMe}
              profile={
                profile as unknown as {
                  id: string;
                  display_name: string;
                  avatar_url: string | null;
                  cover_url: string | null;
                  status_message: string | null;
                }
              }
            />

            <div className="pt-12">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                {profile.display_name}
              </h1>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="size-2 rounded-full bg-green-500"></span>
                <span className="text-muted-foreground">En línea</span>
              </div>
              <StatusMessageEditor
                profileId={profile.id}
                initialStatus={profile.status_message}
                isMe={isMe}
              />
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-foreground/80">
              <ProfileDetailsEditor
                profileId={profile.id}
                initialAge={(profile as unknown as { age: number | null }).age}
                initialLocation={profile.location}
                isMe={isMe}
              />
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 text-primary" />
                <span>
                  Se unió en{" "}
                  {new Date(profile.created_at).toLocaleDateString("es-ES", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:underline">
                    <Users className="size-3.5 text-primary" />
                    <span>
                      {((profile as unknown as Record<string, unknown>).visits_count as number) ||
                        0}{" "}
                      visitas a tu perfil
                    </span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-56" align="start">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Visitas recientes</h4>
                    {recentVisitors.length > 0 ? (
                      <ul className="text-xs space-y-1">
                        {recentVisitors.map(
                          (
                            v: {
                              visitor: { display_name?: string; username?: string } | null;
                              visited_at: string;
                            },
                            i: number,
                          ) => (
                            <li key={i} className="flex justify-between items-center">
                              <span className="font-medium truncate mr-2">
                                {v.visitor?.display_name || v.visitor?.username}
                              </span>
                              <span className="text-muted-foreground shrink-0 text-[10px]">
                                {new Date(v.visited_at).toLocaleDateString()}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">No hay visitas recientes</p>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
              <div className="flex items-center gap-2">
                <Users className="size-3.5 text-primary" />
                <span>348 amigos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Escuchando ahora */}
        <ListeningWidget
          title={musicTrack?.title || "505"}
          artist={musicTrack?.artist || "Arctic Monkeys"}
          album={musicTrack?.album || "Favourite Worst Nightmare"}
          year={musicTrack?.year || "2007"}
          genre="Rock alternativo"
          duration={musicTrack?.duration || "4:13"}
          progress="0:00"
          isPlaying={false}
          compact={false}
          cover={musicTrack?.cover}
          trackData={musicTrack}
          provider={musicTrack?.provider || "Spotify"}
          empty={!musicTrack}
        />

        {/* Información */}
        <div className="bg-card rounded-md border border-[#c2c9d6]  p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Información
            </h3>
            {isMe && (
              <button className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
                <Pencil className="size-3" /> Editar
              </button>
            )}
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <span className="text-muted-foreground">Sexo</span>
              <span>Sin especificar</span>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <span className="text-muted-foreground">Estado civil</span>
              <a href="#" className="text-primary hover:underline">
                Soltero/a
              </a>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <span className="text-muted-foreground">Estudios</span>
              <div>
                <a href="#" className="text-primary hover:underline block truncate">
                  Universidad Complutense de Madrid
                </a>
                <span className="text-muted-foreground text-[10px]">Periodismo</span>
              </div>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <span className="text-muted-foreground">Trabajo</span>
              <a href="#" className="text-primary hover:underline">
                Estudiante
              </a>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <span className="text-muted-foreground">Ciudad actual</span>
              <a href="#" className="text-primary hover:underline">
                {((profile as unknown as Record<string, unknown>).location as string) || "Madrid"}
              </a>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <span className="text-muted-foreground">Página web</span>
              <a href="#" className="text-primary hover:underline truncate">
                inkorium.es/{profile.username}
              </a>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border text-center">
            <button className="flex items-center justify-center gap-1 text-primary text-xs font-medium w-full hover:underline">
              Ver más información <ChevronDown className="size-3" />
            </button>
          </div>
        </div>

        {/* Amigos List */}
        <div className="bg-card rounded-md border border-[#c2c9d6]  p-4">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Amigos (348)
          </h3>
          <div className="flex gap-2">
            <div className="size-10 rounded bg-muted overflow-hidden">
              <img src="https://i.pravatar.cc/150?u=1" className="size-full object-cover" />
            </div>
            <div className="size-10 rounded bg-muted overflow-hidden">
              <img src="https://i.pravatar.cc/150?u=2" className="size-full object-cover" />
            </div>
            <div className="size-10 rounded bg-muted overflow-hidden">
              <img src="https://i.pravatar.cc/150?u=3" className="size-full object-cover" />
            </div>
            <div className="size-10 rounded bg-muted overflow-hidden">
              <img src="https://i.pravatar.cc/150?u=4" className="size-full object-cover" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border text-right">
            <button className="flex items-center justify-end gap-1 text-primary text-xs font-medium w-full hover:underline">
              Ver todos &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* CENTER COLUMN */}
      <div className="space-y-4">
        {/* Main Header Card */}
        <div className="bg-card rounded-md border border-[#c2c9d6] ">
          <div className="p-5 pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{profile.display_name}</h1>
                <div className="flex items-start gap-1 mt-1 text-sm text-muted-foreground">
                  <Quote className="size-3 shrink-0 mt-0.5" />
                  <span className="italic">{profile.bio || "Vive y deja vivir."}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {isMe ? (
                  <EditProfileButton profile={profile} />
                ) : friendship?.status === "accepted" ? (
                  <Link
                    to="/mensajes/$username"
                    params={{ username: profile.username }}
                    className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground text-sm font-bold py-1.5 px-3 rounded hover:bg-muted transition-colors border border-[#c2c9d6]"
                  >
                    <MessageCircle className="size-4" /> Mensaje privado
                  </Link>
                ) : friendship?.status === "pending" && friendship.addressee_id === userId ? (
                  <>
                    <button
                      onClick={() => acceptReq.mutate()}
                      className="inline-flex items-center gap-1 bg-primary text-white text-sm font-bold py-1.5 px-3 rounded hover:bg-primary-hover transition-colors"
                    >
                      <Check className="size-4" /> Aceptar
                    </button>
                    <button
                      onClick={() => removeReq.mutate()}
                      className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-sm py-1.5 px-3 rounded hover:bg-muted border border-[#c2c9d6]"
                    >
                      <X className="size-4" />
                    </button>
                  </>
                ) : friendship?.status === "pending" ? (
                  <button
                    onClick={() => removeReq.mutate()}
                    className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground text-sm py-1.5 px-3 rounded hover:bg-muted border border-[#c2c9d6]"
                  >
                    Solicitud enviada
                  </button>
                ) : (
                  <button
                    onClick={() => sendReq.mutate()}
                    disabled={sendReq.isPending}
                    className="inline-flex items-center gap-2 bg-primary text-white text-sm font-bold py-1.5 px-3 rounded hover:bg-primary-hover transition-colors"
                  >
                    <UserPlus className="size-4" /> Añadir amigo
                  </button>
                )}
                <button className="px-2 py-1.5 border border-[#c2c9d6] rounded hover:bg-secondary transition-colors text-muted-foreground">
                  <MoreHorizontal className="size-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-6 flex flex-wrap gap-1 hide-scrollbar">
              {["Tablón", "Información", "Fotos (84)", "Vídeos (7)", "Amigos (348)"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <button className="px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground whitespace-nowrap flex items-center gap-1">
                Más <ChevronDown className="size-3" />
              </button>
            </div>
          </div>
        </div>

        {activeTab === "Tablón" && (
          <>
            {/* Post Composer */}
            <div className="bg-card rounded-md border border-[#c2c9d6]  p-4 flex gap-3">
              <div className="size-10 rounded bg-[#6F779E] shrink-0 grid place-items-center text-white font-bold">
                {initials(profile.display_name)}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe en su tablón..."
                  className="flex-1 bg-surface border border-[#c2c9d6] rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded text-sm font-bold transition-colors">
                  Publicar
                </button>
              </div>
            </div>

            {/* Feed */}
            <div className="space-y-4">
              {feed.length === 0 && (
                <div className="bg-card rounded-md border border-[#c2c9d6] p-6 text-center text-sm text-muted-foreground">
                  Aún no hay publicaciones en este tablón.
                </div>
              )}
              {feed.map((p) => (
                <PostCard key={p.id} post={p} currentUserId={userId} />
              ))}
            </div>
          </>
        )}

        {activeTab !== "Tablón" && (
          <div className="bg-card rounded-md border border-[#c2c9d6]  p-6 text-center text-sm text-muted-foreground">
            Contenido de la pestaña {activeTab}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-4 hidden lg:block">
        {/* Fotos */}
        <div className="bg-card rounded-md border border-[#c2c9d6]  p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Fotos recientes
            </h3>
            <button className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1">
              Álbumes (9) <ChevronDown className="size-3" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1 mb-3">
            <div className="aspect-square bg-muted">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&q=80&fit=crop"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square bg-muted">
              <img
                src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=150&q=80&fit=crop"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square bg-muted">
              <img
                src="https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=150&q=80&fit=crop"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square bg-muted">
              <img
                src="https://images.unsplash.com/photo-1480796927426-f609979314bd?w=150&q=80&fit=crop"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square bg-muted">
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=150&q=80&fit=crop"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square bg-muted">
              <img
                src="https://images.unsplash.com/photo-1473496169904-658ba37448eb?w=150&q=80&fit=crop"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <button className="text-[11px] font-medium text-primary hover:underline">
            Ver todas las fotos &rarr;
          </button>
        </div>

        {/* Mi Playlist */}
        <div className="bg-card rounded-md border border-[#c2c9d6]  p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              MI PLAYLIST
            </h3>
            <button className="text-[11px] font-medium text-primary hover:underline">
              Ver todos &rarr;
            </button>
          </div>
          <div className="flex gap-3 mb-4">
            <div className="size-16 bg-black rounded-sm overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&q=80&fit=crop"
                alt="Playlist"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <p className="text-sm font-bold truncate text-foreground">conciertos 2025</p>
              <p className="text-xs text-muted-foreground">5 canciones • 18 min</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            {[
              { n: 1, title: "505", artist: "Arctic Monkeys", duration: "4:13" },
              { n: 2, title: "Do I Wanna Know?", artist: "Arctic Monkeys", duration: "4:32" },
              { n: 3, title: "Reptilia", artist: "The Strokes", duration: "3:41" },
              { n: 4, title: "Last Nite", artist: "The Strokes", duration: "3:13" },
              { n: 5, title: "Mr. Brightside", artist: "The Killers", duration: "3:43" },
            ].map((song) => (
              <div
                key={song.n}
                className="flex items-center justify-between text-xs hover:bg-secondary/50 p-1.5 -mx-1.5 rounded-sm cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-muted-foreground w-3 text-right font-medium">{song.n}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate leading-tight">
                      {song.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate leading-tight">
                      {song.artist}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground ml-2 font-medium">
                  {song.duration}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 border border-[#c2c9d6] rounded text-[11px] font-medium hover:bg-secondary transition-colors">
            <Play className="size-3" /> Abrir reproductor completo
          </button>
        </div>
        {/* Amigos en común */}
        <div className="bg-card rounded-md border border-[#c2c9d6]  p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Amigos en común (23)
            </h3>
            <button className="text-[11px] font-medium text-primary hover:underline">
              Ver todos &rarr;
            </button>
          </div>
          <div className="flex justify-between gap-1">
            <div className="text-center">
              <img
                src="https://i.pravatar.cc/150?u=5"
                className="size-10 rounded mx-auto mb-1 object-cover"
              />
              <span className="text-[10px] text-primary hover:underline block truncate w-12">
                Ricardo
              </span>
            </div>
            <div className="text-center">
              <img
                src="https://i.pravatar.cc/150?u=6"
                className="size-10 rounded mx-auto mb-1 object-cover"
              />
              <span className="text-[10px] text-primary hover:underline block truncate w-12">
                Ana
              </span>
            </div>
            <div className="text-center">
              <img
                src="https://i.pravatar.cc/150?u=7"
                className="size-10 rounded mx-auto mb-1 object-cover"
              />
              <span className="text-[10px] text-primary hover:underline block truncate w-12">
                Marta
              </span>
            </div>
            <div className="text-center">
              <img
                src="https://i.pravatar.cc/150?u=8"
                className="size-10 rounded mx-auto mb-1 object-cover"
              />
              <span className="text-[10px] text-primary hover:underline block truncate w-12">
                Sergio
              </span>
            </div>
            <div className="text-center">
              <img
                src="https://i.pravatar.cc/150?u=9"
                className="size-10 rounded mx-auto mb-1 object-cover"
              />
              <span className="text-[10px] text-primary hover:underline block truncate w-12">
                Irene
              </span>
            </div>
          </div>
        </div>

        {/* Visitas a tu perfil */}
        <div className="bg-card rounded-md border border-[#c2c9d6]  p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Visitas a tu perfil
            </h3>
            <button className="text-[11px] font-medium text-primary hover:underline">
              Ver todas &rarr;
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img src="https://i.pravatar.cc/150?u=10" className="size-5 rounded object-cover" />
                <span className="text-primary font-bold hover:underline">Laura Pérez</span>
              </div>
              <span className="text-muted-foreground text-[10px]">hace 10 minutos</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img src="https://i.pravatar.cc/150?u=11" className="size-5 rounded object-cover" />
                <span className="text-primary font-bold hover:underline">Ricardo Bartolomé</span>
              </div>
              <span className="text-muted-foreground text-[10px]">hace 1 hora</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img src="https://i.pravatar.cc/150?u=12" className="size-5 rounded object-cover" />
                <span className="text-primary font-bold hover:underline">Ana García</span>
              </div>
              <span className="text-muted-foreground text-[10px]">hace 3 horas</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img src="https://i.pravatar.cc/150?u=13" className="size-5 rounded object-cover" />
                <span className="text-primary font-bold hover:underline">Carlos López</span>
              </div>
              <span className="text-muted-foreground text-[10px]">ayer</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img src="https://i.pravatar.cc/150?u=14" className="size-5 rounded object-cover" />
                <span className="text-primary font-bold hover:underline">Marta Ruiz</span>
              </div>
              <span className="text-muted-foreground text-[10px]">ayer</span>
            </div>
          </div>
        </div>

        {/* Amigos sugeridos */}
        <div className="bg-card rounded-md border border-[#c2c9d6]  p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Amigos sugeridos
            </h3>
            <button className="text-[11px] font-medium text-primary hover:underline">
              Ver todos &rarr;
            </button>
          </div>
          <div className="space-y-3">
            {[
              { name: "Pedro Pascal", mutual: 5, avatar: "https://i.pravatar.cc/150?u=15" },
              { name: "Rosalía", mutual: 12, avatar: "https://i.pravatar.cc/150?u=16" },
              { name: "C. Tangana", mutual: 3, avatar: "https://i.pravatar.cc/150?u=17" },
            ].map((sugerido, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img src={sugerido.avatar} className="size-8 rounded object-cover" />
                  <div>
                    <span className="text-primary font-bold hover:underline block cursor-pointer">
                      {sugerido.name}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      {sugerido.mutual} amigos en común
                    </span>
                  </div>
                </div>
                <button className="text-[10px] bg-secondary border border-[#c2c9d6] px-2 py-1 rounded hover:bg-muted font-medium">
                  Añadir
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function EditProfileButton({
  profile,
}: {
  profile: { id: string; display_name: string; bio: string | null; avatar_url: string | null };
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName, bio: bio || null, avatar_url: avatarUrl || null })
        .eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Perfil actualizado");
      qc.invalidateQueries();
      setOpen(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
      >
        <Pencil className="size-3" /> Editar
      </button>
    );
  }
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-card rounded-sm p-6 w-full max-w-md border border-[#c2c9d6] shadow-none space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">Editar perfil</h3>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Nombre</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Biografía</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">URL de tu avatar</label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm rounded-lg hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="bg-primary text-white px-4 py-2 text-sm rounded-lg hover:bg-primary-hover"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcomponents for Cover and Avatar logic
function CoverImage({
  isMe,
  profile,
  currentUserId,
}: {
  isMe: boolean;
  profile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    cover_url: string | null;
    status_message: string | null;
  };
  currentUserId: string;
}) {
  const [hover, setHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropData, setCropData] = useState<{ src: string; file: File } | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const src = URL.createObjectURL(file);
      setCropData({ src, file });
    }
  };

  return (
    <>
      <div
        className="h-28 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 relative group cursor-pointer"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => {
          if (isMe) fileInputRef.current?.click();
        }}
      >
        <img
          src={
            profile.cover_url ||
            "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1000&auto=format&fit=crop"
          }
          alt="Cover"
          className="w-full h-full object-cover"
        />

        {isMe && hover && (
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center transition-all">
            <button className="bg-black/50 text-white flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm hover:bg-black/70">
              <Camera className="size-4" /> Cambiar portada
            </button>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={onFileChange}
      />

      {cropData && (
        <CropModal
          open={true}
          onOpenChange={(v) => !v && setCropData(null)}
          src={cropData.src}
          aspect={1000 / 280}
          field="cover_url"
          profileId={profile.id}
          onSuccess={() => setCropData(null)}
        />
      )}
    </>
  );
}

function AvatarImage({
  isMe,
  profile,
  currentUserId,
}: {
  isMe: boolean;
  profile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    cover_url: string | null;
    status_message: string | null;
  };
  currentUserId: string;
}) {
  const [hover, setHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropData, setCropData] = useState<{ src: string; file: File } | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const src = URL.createObjectURL(file);
      setCropData({ src, file });
    }
  };

  return (
    <>
      <div
        className="size-20 rounded-md overflow-hidden ring-2 ring-card bg-muted grid place-items-center text-3xl font-semibold text-white bg-[#6F779E] shrink-0 absolute -top-10 group cursor-pointer"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => {
          if (isMe) fileInputRef.current?.click();
        }}
      >
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="size-full object-cover" />
        ) : (
          initials(profile.display_name)
        )}

        {isMe && hover && (
          <div className="absolute inset-0 bg-black/40 grid place-items-center transition-all">
            <div className="bg-black/60 p-1.5 rounded-full text-white">
              <Camera className="size-4" />
            </div>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={onFileChange}
      />

      {cropData && (
        <CropModal
          open={true}
          onOpenChange={(v) => !v && setCropData(null)}
          src={cropData.src}
          aspect={1}
          field="avatar_url"
          profileId={profile.id}
          onSuccess={() => setCropData(null)}
        />
      )}
    </>
  );
}

function CropModal({
  open,
  onOpenChange,
  src,
  aspect,
  field,
  profileId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  aspect: number;
  field: "avatar_url" | "cover_url";
  profileId: string;
  onSuccess: () => void;
}) {
  const [crop, setCrop] = useState<Crop>({ unit: "%", width: 50, height: 50, x: 25, y: 25 });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!completedCrop || !imgRef.current) return;
    setLoading(true);

    try {
      const canvas = document.createElement("canvas");
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("No 2d context");

      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob error"))),
          "image/jpeg",
          0.9,
        );
      });

      const fileName = `${field}s/${profileId}-${Date.now()}.jpg`;

      // Upload to supabase
      const { error: uploadError } = await supabase.storage.from("media").upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update(
          field === "avatar_url"
            ? { avatar_url: publicUrlData.publicUrl }
            : { cover_url: publicUrlData.publicUrl },
        )
        .eq("id", profileId);

      if (updateError) throw updateError;

      toast.success("Imagen actualizada");
      qc.invalidateQueries({ queryKey: ["profile"] });
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar imagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Recortar imagen</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 mt-2">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
          >
            <img
              ref={imgRef}
              src={src}
              alt="Crop preview"
              className="max-h-[60vh] object-contain"
            />
          </ReactCrop>

          <div className="flex justify-end gap-2 w-full pt-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm rounded-lg hover:bg-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={save}
              disabled={loading || !completedCrop}
              className="bg-primary text-white px-4 py-2 text-sm rounded-lg hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProfileDetailsEditor({
  profileId,
  initialAge,
  initialLocation,
  isMe,
}: {
  profileId: string;
  initialAge: number | null;
  initialLocation: string | null;
  isMe: boolean;
}) {
  const [age, setAge] = useState(initialAge?.toString() || "");
  const [location, setLocation] = useState(initialLocation || "");
  const [isOpen, setIsOpen] = useState(false);
  const qc = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (data: { age: number | null; location: string | null }) => {
      const { error } = await supabase
        .from("profiles")
        .update(data as never)
        .eq("id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Perfil actualizado");
      qc.invalidateQueries({ queryKey: ["profile"] });
      setIsOpen(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error al actualizar perfil"),
  });

  const handleSave = () => {
    const ageNum = parseInt(age);
    updateProfile.mutate({
      age: isNaN(ageNum) ? null : ageNum,
      location: location.trim() === "" ? null : location.trim(),
    });
  };

  const displayString = `${initialAge ? initialAge + " años" : "Sin edad"}${initialLocation ? ", " + initialLocation : ""}`;

  if (!isMe) {
    return (
      <div className="flex items-center gap-2">
        <Cake className="size-3.5 text-primary" />
        <span>{displayString}</span>
      </div>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 hover:underline text-left">
          <Cake className="size-3.5 text-primary" />
          <span>{displayString}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Edad</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Ej. 24"
              className="w-full bg-secondary rounded-md px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Ubicación</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej. Madrid"
              className="w-full bg-secondary rounded-md px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="w-full bg-primary text-white py-1.5 text-xs font-semibold rounded-md hover:bg-primary-hover disabled:opacity-50"
          >
            {updateProfile.isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function StatusMessageEditor({
  profileId,
  initialStatus,
  isMe,
}: {
  profileId: string;
  initialStatus: string | null;
  isMe: boolean;
}) {
  const [status, setStatus] = useState(initialStatus || "");
  const [isOpen, setIsOpen] = useState(false);
  const qc = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ status_message: newStatus })
        .eq("id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Estado actualizado");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error al actualizar estado"),
  });

  const handleSave = () => {
    if (status !== initialStatus) {
      updateStatus.mutate(status);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  if (!isMe) {
    if (!initialStatus) return null;
    return <div className="mt-2 text-sm text-foreground/90 italic">{initialStatus}</div>;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="mt-2 text-sm text-foreground/90 italic hover:underline text-left block w-full">
          {initialStatus || "Añade un estado personalizado..."}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">
            Estado personalizado
          </label>
          <input
            autoFocus
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            maxLength={100}
            placeholder="¿Qué estás pensando?"
            className="w-full bg-secondary rounded-md px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="text-[10px] text-muted-foreground text-right">{status.length}/100</div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
