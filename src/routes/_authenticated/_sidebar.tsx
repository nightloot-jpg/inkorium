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
        .single();
      return data;
    },
  });

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
    <main className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] lg:justify-center gap-6 py-4 w-full">
      <aside className="space-y-4 hidden lg:block">
        <div className="bg-card rounded-sm border border-[#c2c9d6] overflow-hidden p-4">
          <div className="flex gap-4">
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
                className="text-[13px] font-bold text-[#0b439c] hover:underline"
              >
                Ver mi perfil »
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-sm border border-[#c2c9d6] p-2 flex flex-col gap-0.5">
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

        <div className="bg-card rounded-sm border border-[#c2c9d6] p-4 flex flex-col gap-3">
          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Amigos conectados ({friends.length})
          </h4>
          <div className="flex flex-col gap-2.5">
            {friends.slice(0, 5).map((friend) => (
              <div key={friend.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar profile={friend} size={28} />
                  <Link
                    to="/perfil/$username"
                    params={{ username: friend.username }}
                    className="text-[13px] font-bold text-foreground hover:underline truncate"
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
            <Link to="/amigos" className="text-[12px] font-bold text-[#0b439c] hover:underline">
              Ver todos »
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-sm border border-[#c2c9d6] p-4 flex flex-col gap-3">
          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Escuchando ahora
          </h4>
          <div className="flex items-center gap-3">
            <div className="size-12 rounded bg-black flex-shrink-0 flex items-center justify-center overflow-hidden">
              <span className="text-white text-[10px] text-center leading-tight opacity-50 px-1">
                Favourite Worst
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-foreground truncate">505</span>
              <span className="text-[13px] text-muted-foreground truncate">Arctic Monkeys</span>
              <span className="text-[13px] text-muted-foreground truncate">Favourite Wor...</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-muted-foreground">1:42</span>
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="w-2/5 h-full bg-[#0b439c]" />
            </div>
            <span className="text-[11px] text-muted-foreground">4:13</span>
          </div>
        </div>
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
      className={`flex items-center gap-2.5 px-3 py-2 rounded transition-colors justify-between ${
        isActive
          ? "bg-secondary/80 text-[#0b439c] font-bold text-[13px]"
          : "hover:bg-secondary/50 text-foreground font-medium text-[13px]"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon className={`size-[18px] ${isActive ? "text-[#0b439c]" : "text-muted-foreground"}`} />
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
