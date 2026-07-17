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
import {
  Search,
  Home,
  Users,
  MessageCircle,
  Bell,
  LogOut,
  UserCircle2,
  ChevronDown,
  Video,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { userId: data.user.id };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { userId } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      {/* Top Header - Like the screenshot (blue background) */}
      <header className="sticky top-0 z-50 bg-[#2b65a5] dark:bg-[#1a416b] text-white shadow-sm border-b border-transparent">
        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 h-full">
            <Link
              to="/feed"
              className="font-extrabold text-2xl tracking-tighter shrink-0 flex items-center gap-1"
            >
              INKORIUM
            </Link>

            <button className="hidden md:flex h-8 w-8 items-center justify-center rounded-md bg-white/10 hover:bg-white/20 transition-colors">
              <span className="text-xl leading-none mb-1">+</span>
            </button>

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
              <TopNavIcon to="/feed" label="Vídeos" />
            </nav>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="relative w-full max-w-[300px] hidden md:block">
              <input
                type="text"
                placeholder="Buscar personas, música, vídeos..."
                className="w-full bg-[#1b4e85] dark:bg-[#0f2e51] text-white placeholder-white/70 rounded px-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-white/50 transition-shadow"
              />
              <Search className="absolute inset-y-0 right-3 my-auto size-4 text-white/70 pointer-events-none" />
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button className="flex items-center gap-1 text-sm font-medium hover:bg-white/10 px-2 py-1.5 rounded transition-colors">
                {me?.username || "Usuario"} <ChevronDown className="size-4" />
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
        </div>
      </header>

      <Outlet />
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
      className={`relative h-full flex items-center px-4 font-medium text-sm transition-colors border-b-2 ${
        active ? "border-white bg-white/10" : "border-transparent hover:bg-white/5"
      }`}
    >
      {label}
      {badge && badge > 0 ? (
        <span className="absolute top-2 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full grid place-items-center">
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
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setState({ id: data.user.id });
    });
  }, []);
  return state;
}
