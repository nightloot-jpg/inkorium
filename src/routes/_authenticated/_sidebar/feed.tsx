import React from "react";
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
import { searchYoutubeFn } from "@/lib/youtube";
import { useDebounce } from "@/hooks/use-debounce";

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
    <div className="flex flex-col lg:grid lg:grid-cols-[minmax(500px,1fr)_330px] lg:justify-center gap-[30px] w-full">
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
        <div className="flex flex-col gap-5">
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
            <span className="text-primary font-normal cursor-pointer hover:underline text-xs">
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
            <span className="text-primary font-normal cursor-pointer hover:underline text-xs">
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
              <h5 className="font-bold text-[13px] text-primary leading-tight">
                Concierto Indie en Madrid
              </h5>
              <p className="text-xs text-muted-foreground mt-1">Viernes, 24 de Mayo a las 21:00</p>
              <p className="text-xs text-muted-foreground">Sala La Riviera</p>
            </div>
          </div>
          <button className="w-fit border border-primary text-primary font-medium text-xs px-3 py-1.5 rounded-[18px] mt-3 hover:bg-accent transition-colors block ml-auto mr-auto">
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
  const [musicSubTab, setMusicSubTab] = useState("search");
  const [musicSearchQuery, setMusicSearchQuery] = useState("");
  const debouncedMusicSearchQuery = useDebounce(musicSearchQuery, 500);
  const [searchResults, setSearchResults] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (musicSubTab !== "search" || !debouncedMusicSearchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const search = async () => {
      try {
        const data = await searchYoutubeFn({ data: debouncedMusicSearchQuery });
        if (data.results) {
          setSearchResults(data.results);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Failed to search music:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    search();
  }, [debouncedMusicSearchQuery, musicSubTab]);

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
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${new Date().getTime()}.${ext}`;

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

      const finalType = activeTab;
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
        payload.youtube_channel = extraData.youtube_channel;
        payload.youtube_duration = extraData.youtube_duration;
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
      if (activeTab === "poll") {
        payload.metadata = {
          options: [extraData.pollOption1, extraData.pollOption2, extraData.pollOption3].filter(
            Boolean,
          ),
        };
      }
      if (activeTab === "album") {
        payload.metadata = { name: extraData.name };
        payload.image_url = mediaUrl;
      }
      if (activeTab === "playlist") {
        payload.metadata = { name: extraData.name, link: extraData.link };
      }
      if (activeTab === "location") {
        payload.metadata = { name: extraData.location };
      }
      if (activeTab === "celebration") {
        payload.metadata = { title: extraData.title };
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
    <div className="bg-white rounded-md border border-[#dbe0e8] flex flex-col p-6 shadow-sm">
      {/* Row 1: Cabecera con avatar y caja de texto / Compositores Especiales */}
      <div className="flex gap-3 items-start mb-4">
        {activeTab !== "music" &&
          (avatar?.avatar_url ? (
            <img
              src={avatar.avatar_url}
              alt="Avatar"
              className="w-12 h-12 rounded-lg object-cover border border-[#e6eaf0]"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-[#e6eaf0] flex items-center justify-center shrink-0 border border-[#dbe0e8]">
              <span className="text-primary text-lg font-bold">
                {avatar?.display_name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          ))}

        {activeTab === "music" ? (
          <div className="flex-1 flex flex-col gap-3">
            {!extraData.youtube_id ? (
              <div className="border border-[#dbe0e8] rounded-md p-4 bg-[#f8fafc] flex flex-col gap-4">
                <div className="flex gap-4 border-b border-[#e6eaf0] pb-2">
                  <button
                    onClick={() => setMusicSubTab("search")}
                    className={`text-[13px] font-medium pb-2 border-b-2 transition-colors ${musicSubTab === "search" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-black"}`}
                  >
                    Buscar
                  </button>
                  <button
                    onClick={() => setMusicSubTab("link")}
                    className={`text-[13px] font-medium pb-2 border-b-2 transition-colors ${musicSubTab === "link" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-black"}`}
                  >
                    Pegar enlace
                  </button>
                  <button
                    onClick={() => setMusicSubTab("playlist")}
                    className={`text-[13px] font-medium pb-2 border-b-2 transition-colors ${musicSubTab === "playlist" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-black"}`}
                  >
                    Playlist
                  </button>
                  <button
                    onClick={() => setMusicSubTab("album")}
                    className={`text-[13px] font-medium pb-2 border-b-2 transition-colors ${musicSubTab === "album" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-black"}`}
                  >
                    Álbum
                  </button>
                </div>

                {musicSubTab === "search" && (
                  <div className="flex flex-col gap-3">
                    <div className="relative flex items-center">
                      <Search className="w-5 h-5 absolute left-3 text-muted-foreground" />
                      <input
                        type="text"
                        value={musicSearchQuery}
                        onChange={(e) => setMusicSearchQuery(e.target.value)}
                        placeholder="Buscar canción, artista, álbum o pegar enlace"
                        className="w-full bg-white border border-[#c2c9d6] rounded-md py-3 pl-10 pr-4 text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                      />
                    </div>

                    {musicSearchQuery.length > 0 && (
                      <div className="bg-white border border-[#e6eaf0] rounded-md shadow-sm overflow-hidden flex flex-col mt-2 max-h-64 overflow-y-auto">
                        {isSearching ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Buscando...
                          </div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map(
                            (song: {
                              id: string;
                              title: string;
                              artist: string;
                              cover: string;
                              duration: string;
                            }) => (
                              <button
                                key={song.id}
                                onClick={() => {
                                  setExtraData({
                                    ...extraData,
                                    youtube_id: song.id,
                                    youtube_title: song.title,
                                    youtube_channel: song.artist,
                                    youtube_duration: song.duration,
                                  });
                                }}
                                className="flex items-center gap-3 p-3 hover:bg-[#f1f3f6] transition-colors text-left border-b border-[#f1f3f6] last:border-0"
                              >
                                <img
                                  src={song.cover}
                                  alt="cover"
                                  className="w-10 h-10 rounded-sm object-cover"
                                />
                                <div className="flex flex-col flex-1 min-w-0">
                                  <span className="text-[14px] font-bold text-black truncate">
                                    {song.title}
                                  </span>
                                  <span className="text-[12px] text-muted-foreground truncate">
                                    {song.artist}
                                  </span>
                                </div>
                                <span className="text-[12px] text-muted-foreground font-medium">
                                  {song.duration}
                                </span>
                              </button>
                            ),
                          )
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No se encontraron resultados
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {musicSubTab === "link" && (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={musicSearchQuery}
                      onChange={(e) => setMusicSearchQuery(e.target.value)}
                      placeholder="Pega un enlace de YouTube aquí..."
                      className="w-full bg-white border border-[#c2c9d6] rounded-md py-3 px-4 text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                    />
                    <button
                      onClick={() => {
                        // Extract youtube ID from link
                        const match = musicSearchQuery.match(
                          /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/,
                        );
                        if (match && match[1]) {
                          setExtraData({
                            ...extraData,
                            youtube_id: match[1],
                            youtube_title: "Enlace de YouTube",
                            youtube_channel: "Desconocido",
                            youtube_duration: "0:00",
                          });
                        } else if (musicSearchQuery.length === 11) {
                          setExtraData({
                            ...extraData,
                            youtube_id: musicSearchQuery,
                            youtube_title: "Enlace de YouTube",
                            youtube_channel: "Desconocido",
                            youtube_duration: "0:00",
                          });
                        } else {
                          toast.error("Enlace no válido");
                        }
                      }}
                      className="bg-secondary text-foreground px-4 py-2 rounded-md text-sm font-medium border border-border w-fit"
                    >
                      Añadir enlace
                    </button>
                  </div>
                )}

                {(musicSubTab === "playlist" || musicSubTab === "album") && (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={musicSearchQuery}
                      onChange={(e) => setMusicSearchQuery(e.target.value)}
                      placeholder={`Pega un enlace de ${musicSubTab === "playlist" ? "Playlist" : "Álbum"} aquí...`}
                      className="w-full bg-white border border-[#c2c9d6] rounded-md py-3 px-4 text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                    />
                    <button
                      onClick={() => {
                        if (musicSearchQuery.trim()) {
                          setExtraData({
                            ...extraData,
                            youtube_id: musicSearchQuery, // Or use a different field, but we need youtube_id for the UI preview logic
                            youtube_title: `Enlace de ${musicSubTab === "playlist" ? "Playlist" : "Álbum"}`,
                            youtube_channel: "Desconocido",
                            youtube_duration: "0:00",
                          });
                        }
                      }}
                      className="bg-secondary text-foreground px-4 py-2 rounded-md text-sm font-medium border border-border w-fit"
                    >
                      Añadir {musicSubTab === "playlist" ? "Playlist" : "Álbum"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="bg-[#f8fafc] border border-[#dbe0e8] rounded-lg p-3 flex gap-4 items-center shadow-sm relative">
                  <img
                    src={`https://i.ytimg.com/vi/${extraData.youtube_id}/hqdefault.jpg`}
                    className="w-16 h-16 rounded-md object-cover shadow-sm border border-[#e6eaf0]"
                    alt="cover"
                  />
                  <div className="flex flex-col flex-1 min-w-0 pr-8">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[15px] font-bold text-black truncate">
                        {extraData.youtube_title}
                      </span>
                      <span className="text-[12px] text-muted-foreground font-medium shrink-0 ml-2">
                        {extraData.youtube_duration || "0:00"}
                      </span>
                    </div>
                    <span className="text-[13px] text-[#5c6b89] font-medium truncate">
                      {extraData.youtube_channel} •{" "}
                      {extraData.youtube_duration ? "Music" : "YouTube"}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const newData = { ...extraData };
                      delete newData.youtube_id;
                      delete newData.youtube_title;
                      delete newData.youtube_channel;
                      delete newData.youtube_duration;
                      setExtraData(newData);
                    }}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive bg-white hover:bg-red-50 p-1.5 rounded-md transition-colors border border-transparent hover:border-red-200"
                    title="Quitar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-3 items-start mt-2">
                  {avatar?.avatar_url ? (
                    <img
                      src={avatar.avatar_url}
                      alt="Avatar"
                      className="w-10 h-10 rounded-lg object-cover border border-[#e6eaf0]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[#e6eaf0] flex items-center justify-center shrink-0 border border-[#dbe0e8]">
                      <span className="text-primary text-base font-bold">
                        {avatar?.display_name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 border border-[#dbe0e8] rounded-md p-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all bg-white flex flex-col">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full bg-transparent p-0 text-[14px] resize-none h-[24px] outline-none placeholder:text-muted-foreground"
                      placeholder={`Añade un comentario sobre esta música, ${firstName.toLowerCase()}...`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 border border-[#dbe0e8] rounded-md p-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all bg-white flex flex-col">
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
                <div className="flex flex-col gap-2 mt-2">
                  <input
                    value={extraData.pollOption1 || ""}
                    onChange={(e) => setExtraData({ ...extraData, pollOption1: e.target.value })}
                    placeholder="Opción 1"
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none border border-border"
                  />
                  <input
                    value={extraData.pollOption2 || ""}
                    onChange={(e) => setExtraData({ ...extraData, pollOption2: e.target.value })}
                    placeholder="Opción 2"
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none border border-border"
                  />
                  <input
                    value={extraData.pollOption3 || ""}
                    onChange={(e) => setExtraData({ ...extraData, pollOption3: e.target.value })}
                    placeholder="Opción 3 (opcional)"
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none border border-border"
                  />
                </div>
              )}

              {activeTab === "news" && (
                <div className="flex flex-col gap-2 mt-2">
                  <input
                    value={extraData.title || ""}
                    onChange={(e) => setExtraData({ ...extraData, title: e.target.value })}
                    placeholder="Titular de la noticia"
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none border border-border"
                  />
                  <div className="flex gap-2">
                    <input
                      value={mediaUrl || ""}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="URL de la imagen de portada (opcional)"
                      className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="bg-secondary text-foreground px-3 py-2 rounded-lg text-sm font-medium border border-border disabled:opacity-50"
                    >
                      {isUploading ? "Subiendo..." : "Subir foto"}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "album" && (
                <div className="flex flex-col gap-2 mt-2">
                  <input
                    value={extraData.name || ""}
                    onChange={(e) => setExtraData({ ...extraData, name: e.target.value })}
                    placeholder="Nombre del álbum"
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none border border-border"
                  />
                  <div className="flex gap-2">
                    <input
                      value={mediaUrl || ""}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="URL de la imagen del álbum (opcional)"
                      className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="bg-secondary text-foreground px-3 py-2 rounded-lg text-sm font-medium border border-border disabled:opacity-50"
                    >
                      {isUploading ? "Subiendo..." : "Subir portada"}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "playlist" && (
                <div className="flex flex-col gap-2 mt-2">
                  <input
                    value={extraData.name || ""}
                    onChange={(e) => setExtraData({ ...extraData, name: e.target.value })}
                    placeholder="Nombre de la playlist"
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none border border-border"
                  />
                  <input
                    value={extraData.link || ""}
                    onChange={(e) => setExtraData({ ...extraData, link: e.target.value })}
                    placeholder="Enlace de la playlist"
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none border border-border"
                  />
                </div>
              )}

              {activeTab === "location" && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={extraData.location || ""}
                    onChange={(e) => setExtraData({ ...extraData, location: e.target.value })}
                    placeholder="Ubicación o lugar"
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none border border-border"
                  />
                </div>
              )}

              {activeTab === "celebration" && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={extraData.title || ""}
                    onChange={(e) => setExtraData({ ...extraData, title: e.target.value })}
                    placeholder="¿Qué estás celebrando?"
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none border border-border"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Barra de herramientas (Compacta y sin scroll) */}
      <div className="flex items-center overflow-hidden whitespace-nowrap mb-3">
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
      <div className="border-t border-[#e6eaf0] pt-3 flex justify-end items-center gap-4">
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
    <section className="bg-card p-5 rounded-sm border border-[#c2c9d6] ">
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
            className="text-[13px] font-medium text-primary hover:underline truncate"
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
            className="text-[13px] font-medium text-primary hover:underline truncate"
          >
            {profile.display_name}
          </Link>
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => accept.mutate()}
          disabled={accept.isPending || reject.isPending}
          className="bg-primary hover:bg-primary text-white px-2 py-1 rounded text-[11px] font-medium transition-colors disabled:opacity-50"
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
