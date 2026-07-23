import React from "react";
import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/post-card";
import {
  Home,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Video,
  Music,
  Users,
  Flag,
  BarChart2,
  Bookmark,
  Settings,
} from "lucide-react";
import { Route as AuthRoute } from "./route";
import { ListeningWidget } from "@/components/ListeningWidget";
import { TrackData } from "@/lib/music/types";

export const Route = createFileRoute("/_authenticated/_sidebar")({
  component: SidebarLayout,
});

function SidebarLayout() {
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
        .maybeSingle();
      return data;
    },
  });

  const { data: latestMusicPost } = useQuery({
    queryKey: ["latestMusic", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", userId)
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

  const { data: friends = [] } = useQuery({
    queryKey: ["friends", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("friendships")
        .select(
          "requester_id, addressee_id, requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url, online_status), addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, avatar_url, online_status)",
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
        online_status: string | null;
      }>;
    },
  });

  return (
    <main className="flex flex-col lg:grid lg:grid-cols-[340px_1fr] lg:justify-center gap-[30px] py-4 w-full">
      <aside className="space-y-4 hidden lg:block">
        <div className="bg-card rounded-sm border border-[#c2c9d6] overflow-hidden p-5">
          <div className="flex gap-5">
            <div className="w-[84px] h-[84px] shrink-0 rounded border border-[#c2c9d6] bg-muted overflow-hidden">
              <Avatar profile={me} size={84} />
            </div>
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <span className="font-bold text-foreground text-[15px] break-words">
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
                className="text-xs font-normal text-primary hover:underline"
              >
                Ver mi perfil »
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-sm border border-[#c2c9d6] p-5 flex flex-col gap-0.5">
          <SidebarLink to="/feed" icon={Home} label="Novedades" />
          <SidebarLink to="/eventos" icon={CalendarIcon} label="Eventos" badge={2} />
          <SidebarLink to="/fotos" icon={ImageIcon} label="Fotos" />
          <SidebarLink to="/videos" icon={Video} label="Vídeos" />
          <SidebarLink to="/musica" icon={Music} label="Música" />
          <SidebarLink to="/grupos" icon={Users} label="Grupos" />
          <SidebarLink to="/paginas" icon={Flag} label="Páginas" />
          <SidebarLink to="/encuestas" icon={BarChart2} label="Encuestas" />
          <SidebarLink to="/guardados" icon={Bookmark} label="Guardados" />
          <SidebarLink to="/configuracion" icon={Settings} label="Configuración" />
        </div>

        <div className="bg-card rounded-sm border border-[#c2c9d6] p-5 flex flex-col gap-3">
          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            AMIGOS CONECTADOS ({friends.length})
          </h4>
          <div className="flex flex-col gap-3.5">
            {friends.slice(0, 5).map((friend) => (
              <div key={friend.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar profile={friend} size={28} />
                  <Link
                    to="/perfil/$username"
                    params={{ username: friend.username }}
                    className="text-[13px] font-medium text-primary hover:underline truncate"
                  >
                    {friend.display_name}
                  </Link>
                </div>
                <div
                  className={`size-2 rounded-full shrink-0 ${friend.online_status === "ocupado" ? "bg-red-500" : friend.online_status === "ausente" ? "bg-yellow-500" : friend.online_status === "desconectado" ? "bg-gray-400" : "bg-online"}`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-1">
            <Link to="/amigos" className="text-xs font-normal text-primary hover:underline">
              Ver todos »
            </Link>
          </div>
        </div>

        <ListeningWidget
          title={musicTrack?.title || "505"}
          artist={musicTrack?.artist || "Arctic Monkeys"}
          album={musicTrack?.album || "Favourite Worst Nightmare"}
          year={musicTrack?.year || "2007"}
          genre="Rock alternativo"
          duration={musicTrack?.duration || "4:13"}
          progress="0:00"
          isPlaying={false}
          compact={true}
          cover={musicTrack?.cover}
          trackData={musicTrack}
          provider={musicTrack?.provider || "Spotify"}
          empty={!musicTrack}
        />
      </aside>

      <Outlet />
    </main>
  );
}

function SidebarLink({
  to,
  icon: Icon,
  label,
  badge,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = pathname === to;

  return (
    <Link
      to={to as never}
      className={`flex items-center gap-3.5 px-3 py-2 rounded transition-colors justify-between ${
        isActive
          ? "bg-secondary/80 text-primary font-bold text-[13px]"
          : "hover:bg-secondary/50 text-foreground font-medium text-[13px]"
      }`}
    >
      <div className="flex items-center gap-3.5">
        <Icon className={`size-[18px] ${isActive ? "text-primary" : "text-muted-foreground"}`} />
        {label}
      </div>
      {badge !== undefined && (
        <span className="bg-secondary text-muted-foreground text-[11px] font-bold px-1.5 py-0.5 rounded-sm">
          {badge}
        </span>
      )}
    </Link>
  );
}
