import { ThemeToggle } from "@/components/ThemeToggle";
import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, ChevronDown, Bell, Music } from "lucide-react";
import { ColorPickerToggle } from "@/components/ColorPickerToggle";
import { Avatar } from "@/components/post-card";
import { ChatManager } from "@/components/ChatManager";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getSession();

    // Server-side (and client-side initial check): fallback to an empty string if there's no session
    // This allows the route to load, and then the client can re-evaluate.
    if (error || !data.session) {
      if (typeof window !== "undefined") {
        throw redirect({ to: "/auth" });
      }
      return { userId: "" };
    }
    return { userId: data.session.user.id };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { userId } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      alert(`Buscando: ${searchQuery}`);
    }
  };

  const { data: me } = useQuery({
    queryKey: ["me", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: pendingRequests = 0 } = useQuery({
    queryKey: ["friendships-pending-count", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("friendships")
        .select("id", { count: "exact", head: true })
        .eq("addressee_id", userId)
        .eq("status", "pending");
      return count ?? 0;
    },
  });

  const { data: unread = 0 } = useQuery({
    queryKey: ["messages-unread-count", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", userId)
        .is("read_at", null);
      return count ?? 0;
    },
  });

  // Realtime unread count
  useEffect(() => {
    const channel = supabase
      .channel("layout-msgs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `recipient_id=eq.${userId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages-unread-count", userId] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-[100vh] w-full bg-background text-foreground selection:bg-primary/10 flex flex-col">
      {/* Top Header - Like the screenshot (blue background) */}
      <header className="sticky top-0 z-50 bg-primary text-white  border-b border-transparent">
        <div className="w-full max-w-[1800px] mx-auto px-4 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 h-full">
            <Link
              to="/feed"
              className="font-extrabold text-2xl tracking-tighter shrink-0 flex items-center gap-1"
            >
              inkorium
            </Link>

                        <nav className="hidden lg:flex items-center h-full">
              <TopNavIcon to="/feed" label="Inicio" active={pathname === "/feed"} />
              <TopNavIcon
                to="/perfil/$username"
                params={{ username: me?.username ?? "" }}
                label="Perfil"
                active={
                  pathname.startsWith("/perfil/") && !!me && pathname === `/perfil/${me.username}`
                }
              />
              <TopNavIcon
                to="/mensajes"
                label="Mensajes"
                active={pathname.startsWith("/mensajes")}
                badge={unread}
              />
              <TopNavIcon
                to="/amigos"
                label="Personas"
                active={pathname.startsWith("/amigos")}
                badge={pendingRequests}
              />
              <TopNavIcon to="/eventos" label="Eventos" active={pathname.startsWith("/eventos")} />
              <TopNavIcon to="/feed" label="Vídeos" />
              <TopNavIcon to="/feed" label="Música" />
            </nav>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-center max-w-md">
            <div className="relative w-full hidden md:block">
              <input
                type="text"
                placeholder="Buscar personas, música, vídeos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full bg-black/20 text-white placeholder-white/70 rounded px-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-white/50 transition-shadow"
              />
              <Search className="absolute inset-y-0 right-3 my-auto size-4 text-white/70 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="flex items-center justify-center p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors border border-white/10"
              title="Notificaciones"
            >
              <Bell className="size-4" />
            </button>
            <button
              className="flex items-center justify-center p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors border border-white/10"
              title="Música"
            >
              <Music className="size-4" />
            </button>
            <ThemeToggle />
            <ColorPickerToggle />

            <button className="flex items-center gap-2 text-sm font-medium hover:bg-white/10 px-2 py-1 rounded transition-colors">
              <Avatar profile={me} size={28} />
              <span>{me?.username ?? "Usuario"}</span>
              <ChevronDown className="size-4 text-white/70" />
            </button>

            <button
              onClick={handleSignOut}
              title="Salir"
              className="text-sm font-medium hover:bg-white/10 px-2 py-1.5 rounded transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full max-w-[1800px] mx-auto px-4 lg:px-8 flex flex-col">
        <Outlet />
      </div>

      <ChatManager userId={userId} currentUsername={me?.username} />
    </div>
  );
}

function TopNavIcon({
  to,
  params,
  label,
  active,
  badge,
}: {
  to: string;
  params?: Record<string, string>;
  label: string;
  active?: boolean;
  badge?: number;
}) {
  return (
    <Link
      to={to as never}
      params={params as never}
      className={`relative h-full flex items-center gap-1.5 px-4 font-medium text-sm transition-colors border-none ${
        active ? "bg-white/10 font-bold" : "hover:bg-white/5"
      }`}
    >
      {label}
      {badge && badge > 0 ? (
        <span className="min-w-[18px] h-[18px] px-1 bg-[#f03d25] text-white text-[11px] font-bold rounded flex items-center justify-center leading-none">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

// Small utility used elsewhere
export function useMe() {
  const [state, setState] = useState<{ id: string } | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setState({ id: data.session.user.id });
    });
  }, []);
  return state;
}
