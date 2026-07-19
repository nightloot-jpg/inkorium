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
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
          "id, username, display_name, bio, avatar_url, cover_url, created_at, location, visits_count",
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
        "increment_visit_count",
        { profile_id: profile.id },
      ).then(({ error }) => {
        if (error) console.error("Error incrementing view count:", error);
      });
    }
  }, [profile, profile?.id, userId]);

  const isMe = profile?.id === userId;

  const { data: feed = [] } = useQuery({
    queryKey: ["profile-posts", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const all = await fetchFeed(userId);
      return all.filter((p) => p.author.id === profile!.id);
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
    <div className="max-w-[1100px] mx-auto px-4 py-6">
      <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)_250px] gap-4">
        {/* LEFT COLUMN */}
        <div className="space-y-4 hidden lg:block">
          {/* Profile Card */}
          <div className="bg-card rounded-md ring-1 ring-border shadow-sm overflow-hidden">
            <CoverImage
              currentUserId={userId}
              isMe={isMe}
              profile={
                profile as unknown as {
                  id: string;
                  display_name: string;
                  avatar_url: string | null;
                  cover_url: string | null;
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
              </div>

              <div className="mt-4 space-y-2.5 text-xs text-foreground/80">
                <div className="flex items-center gap-2">
                  <Cake className="size-3.5 text-[#2F5FA7]" />
                  <span>24 años, Madrid</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-[#2F5FA7]" />
                  <span>
                    Se unió en{" "}
                    {new Date(profile.created_at).toLocaleDateString("es-ES", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-3.5 text-[#2F5FA7]" />
                  <span>
                    {((profile as unknown as Record<string, unknown>).visits_count as number) ||
                      1842}{" "}
                    visitas a tu perfil
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-3.5 text-[#2F5FA7]" />
                  <span>348 amigos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Escuchando ahora */}
          <div className="bg-card rounded-md ring-1 ring-border shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Escuchando ahora
              </h3>
              <div className="size-5 rounded-full bg-green-500 grid place-items-center">
                <Music className="size-3 text-white" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="size-12 bg-black rounded-sm overflow-hidden flex-shrink-0">
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/8/88/Favourite_Worst_Nightmare.jpg"
                  alt="Album"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">505</p>
                <p className="text-xs text-muted-foreground truncate">Arctic Monkeys</p>
                <p className="text-[10px] text-muted-foreground italic truncate">
                  Favourite Worst Nightmare
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground font-medium">
              <span>1:42</span>
              <div className="flex-1 h-1 bg-secondary mx-2 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-1/3"></div>
              </div>
              <span>4:13</span>
            </div>
            <button className="w-full mt-3 flex items-center justify-center gap-1.5 py-1.5 px-2 ring-1 ring-border rounded text-[11px] font-medium hover:bg-secondary transition-colors">
              <Play className="size-3" /> Abrir en Spotify
            </button>
          </div>

          {/* Información */}
          <div className="bg-card rounded-md ring-1 ring-border shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Información
              </h3>
              {isMe && (
                <button className="flex items-center gap-1 text-[11px] font-medium text-[#2F5FA7] hover:underline">
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
                <a href="#" className="text-[#2F5FA7] hover:underline">
                  Soltero/a
                </a>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-2">
                <span className="text-muted-foreground">Estudios</span>
                <div>
                  <a href="#" className="text-[#2F5FA7] hover:underline block truncate">
                    Universidad Complutense de Madrid
                  </a>
                  <span className="text-muted-foreground text-[10px]">Periodismo</span>
                </div>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-2">
                <span className="text-muted-foreground">Trabajo</span>
                <a href="#" className="text-[#2F5FA7] hover:underline">
                  Estudiante
                </a>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-2">
                <span className="text-muted-foreground">Ciudad actual</span>
                <a href="#" className="text-[#2F5FA7] hover:underline">
                  {((profile as unknown as Record<string, unknown>).location as string) || "Madrid"}
                </a>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-2">
                <span className="text-muted-foreground">Página web</span>
                <a href="#" className="text-[#2F5FA7] hover:underline truncate">
                  inkorium.es/{profile.username}
                </a>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border text-center">
              <button className="flex items-center justify-center gap-1 text-[#2F5FA7] text-xs font-medium w-full hover:underline">
                Ver más información <ChevronDown className="size-3" />
              </button>
            </div>
          </div>

          {/* Amigos List */}
          <div className="bg-card rounded-md ring-1 ring-border shadow-sm p-4">
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
              <button className="flex items-center justify-end gap-1 text-[#2F5FA7] text-xs font-medium w-full hover:underline">
                Ver todos &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="space-y-4">
          {/* Main Header Card */}
          <div className="bg-card rounded-md ring-1 ring-border shadow-sm">
            <div className="p-5 pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">{profile.display_name}</h1>
                <div className="flex gap-2 shrink-0">
                  {isMe ? (
                    <EditProfileButton profile={profile} />
                  ) : friendship?.status === "accepted" ? (
                    <Link
                      to="/mensajes/$username"
                      params={{ username: profile.username }}
                      className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground text-sm font-bold py-1.5 px-3 rounded hover:bg-muted transition-colors ring-1 ring-border"
                    >
                      <MessageCircle className="size-4" /> Mensaje privado
                    </Link>
                  ) : friendship?.status === "pending" && friendship.addressee_id === userId ? (
                    <>
                      <button
                        onClick={() => acceptReq.mutate()}
                        className="inline-flex items-center gap-1 bg-[#2F5FA7] text-white text-sm font-bold py-1.5 px-3 rounded hover:bg-[#264d87] transition-colors"
                      >
                        <Check className="size-4" /> Aceptar
                      </button>
                      <button
                        onClick={() => removeReq.mutate()}
                        className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-sm py-1.5 px-3 rounded hover:bg-muted ring-1 ring-border"
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  ) : friendship?.status === "pending" ? (
                    <button
                      onClick={() => removeReq.mutate()}
                      className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground text-sm py-1.5 px-3 rounded hover:bg-muted ring-1 ring-border"
                    >
                      Solicitud enviada
                    </button>
                  ) : (
                    <button
                      onClick={() => sendReq.mutate()}
                      disabled={sendReq.isPending}
                      className="inline-flex items-center gap-2 bg-[#2F5FA7] text-white text-sm font-bold py-1.5 px-3 rounded hover:bg-[#264d87] transition-colors"
                    >
                      <UserPlus className="size-4" /> Añadir amigo
                    </button>
                  )}
                  <button className="px-2 py-1.5 ring-1 ring-border rounded hover:bg-secondary transition-colors text-muted-foreground">
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 text-sm text-foreground">
                <Quote className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="italic">{profile.bio || "Vive y deja vivir."}</span>
              </div>

              {/* Navigation Tabs */}
              <div className="mt-6 flex overflow-x-auto hide-scrollbar">
                {["Tablón", "Información", "Fotos (84)", "Vídeos (7)", "Amigos (348)"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                        activeTab === tab
                          ? "border-[#2F5FA7] text-[#2F5FA7]"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </button>
                  ),
                )}
                <button className="px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground whitespace-nowrap flex items-center gap-1">
                  Más <ChevronDown className="size-3" />
                </button>
              </div>
            </div>
          </div>

          {activeTab === "Tablón" && (
            <>
              {/* Post Composer */}
              <div className="bg-card rounded-md ring-1 ring-border shadow-sm p-4 flex gap-3">
                <div className="size-10 rounded bg-[#6F779E] shrink-0 grid place-items-center text-white font-bold">
                  {initials(profile.display_name)}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe en su tablón..."
                    className="flex-1 bg-surface ring-1 ring-border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2F5FA7]"
                  />
                  <button className="bg-[#2F5FA7] hover:bg-[#264d87] text-white px-4 py-2 rounded text-sm font-bold transition-colors">
                    Publicar
                  </button>
                </div>
              </div>

              {/* Feed */}
              <div className="space-y-4">
                {feed.length === 0 && (
                  <div className="bg-card rounded-md ring-1 ring-border p-6 text-center text-sm text-muted-foreground">
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
            <div className="bg-card rounded-md ring-1 ring-border shadow-sm p-6 text-center text-sm text-muted-foreground">
              Contenido de la pestaña {activeTab}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4 hidden lg:block">
          {/* Fotos */}
          <div className="bg-card rounded-md ring-1 ring-border shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Fotos
              </h3>
              <button className="text-[11px] font-medium text-[#2F5FA7] hover:underline flex items-center gap-1">
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
            <button className="text-[11px] font-medium text-[#2F5FA7] hover:underline">
              Ver todas las fotos &rarr;
            </button>
          </div>

          {/* Amigos en común */}
          <div className="bg-card rounded-md ring-1 ring-border shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Amigos en común (23)
              </h3>
              <button className="text-[11px] font-medium text-[#2F5FA7] hover:underline">
                Ver todos &rarr;
              </button>
            </div>
            <div className="flex justify-between gap-1">
              <div className="text-center">
                <img
                  src="https://i.pravatar.cc/150?u=5"
                  className="size-10 rounded mx-auto mb-1 object-cover"
                />
                <span className="text-[10px] text-[#2F5FA7] hover:underline block truncate w-12">
                  Ricardo
                </span>
              </div>
              <div className="text-center">
                <img
                  src="https://i.pravatar.cc/150?u=6"
                  className="size-10 rounded mx-auto mb-1 object-cover"
                />
                <span className="text-[10px] text-[#2F5FA7] hover:underline block truncate w-12">
                  Ana
                </span>
              </div>
              <div className="text-center">
                <img
                  src="https://i.pravatar.cc/150?u=7"
                  className="size-10 rounded mx-auto mb-1 object-cover"
                />
                <span className="text-[10px] text-[#2F5FA7] hover:underline block truncate w-12">
                  Marta
                </span>
              </div>
              <div className="text-center">
                <img
                  src="https://i.pravatar.cc/150?u=8"
                  className="size-10 rounded mx-auto mb-1 object-cover"
                />
                <span className="text-[10px] text-[#2F5FA7] hover:underline block truncate w-12">
                  Sergio
                </span>
              </div>
              <div className="text-center">
                <img
                  src="https://i.pravatar.cc/150?u=9"
                  className="size-10 rounded mx-auto mb-1 object-cover"
                />
                <span className="text-[10px] text-[#2F5FA7] hover:underline block truncate w-12">
                  Irene
                </span>
              </div>
            </div>
          </div>

          {/* Visitas a tu perfil */}
          <div className="bg-card rounded-md ring-1 ring-border shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Visitas a tu perfil
              </h3>
              <button className="text-[11px] font-medium text-[#2F5FA7] hover:underline">
                Ver todas &rarr;
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src="https://i.pravatar.cc/150?u=10"
                    className="size-5 rounded object-cover"
                  />
                  <span className="text-[#2F5FA7] font-bold hover:underline">Laura Pérez</span>
                </div>
                <span className="text-muted-foreground text-[10px]">hace 10 minutos</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src="https://i.pravatar.cc/150?u=11"
                    className="size-5 rounded object-cover"
                  />
                  <span className="text-[#2F5FA7] font-bold hover:underline">
                    Ricardo Bartolomé
                  </span>
                </div>
                <span className="text-muted-foreground text-[10px]">hace 1 hora</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src="https://i.pravatar.cc/150?u=12"
                    className="size-5 rounded object-cover"
                  />
                  <span className="text-[#2F5FA7] font-bold hover:underline">Ana García</span>
                </div>
                <span className="text-muted-foreground text-[10px]">hace 3 horas</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src="https://i.pravatar.cc/150?u=13"
                    className="size-5 rounded object-cover"
                  />
                  <span className="text-[#2F5FA7] font-bold hover:underline">Carlos López</span>
                </div>
                <span className="text-muted-foreground text-[10px]">ayer</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src="https://i.pravatar.cc/150?u=14"
                    className="size-5 rounded object-cover"
                  />
                  <span className="text-[#2F5FA7] font-bold hover:underline">Marta Ruiz</span>
                </div>
                <span className="text-muted-foreground text-[10px]">ayer</span>
              </div>
            </div>
          </div>

          {/* Eventos */}
          <div className="bg-card rounded-md ring-1 ring-border shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Eventos
              </h3>
              <button className="text-[11px] font-medium text-[#2F5FA7] hover:underline">
                Ver todos &rarr;
              </button>
            </div>
            <div className="flex gap-3">
              <div className="w-14 h-20 rounded overflow-hidden shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1540039155732-68473668f430?w=200&q=80&fit=crop"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-start gap-2 mb-1">
                  <div className="text-center leading-none">
                    <span className="block text-sm font-bold">24</span>
                    <span className="block text-[8px] uppercase font-bold text-muted-foreground">
                      MAY
                    </span>
                  </div>
                  <div className="min-w-0">
                    <a
                      href="#"
                      className="text-xs font-bold text-[#2F5FA7] hover:underline block truncate"
                    >
                      Concierto Indie en Madrid
                    </a>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Viernes, 24 de Mayo a las 21:00
                    </p>
                    <p className="text-[10px] text-muted-foreground">Sala La Riviera</p>
                  </div>
                </div>
                <button className="mt-2 px-3 py-1 ring-1 ring-border rounded text-[11px] font-medium hover:bg-secondary transition-colors">
                  Asistir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2F5FA7] hover:underline"
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
        className="bg-card rounded-2xl p-6 w-full max-w-md ring-1 ring-border shadow-card space-y-4"
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
            className="bg-[#2F5FA7] text-white px-4 py-2 text-sm rounded-lg hover:bg-[#264d87]"
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
              className="bg-[#2F5FA7] text-white px-4 py-2 text-sm rounded-lg hover:bg-[#264d87] disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
