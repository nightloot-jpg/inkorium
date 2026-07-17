import { createFileRoute, Outlet, redirect, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Home, Users, MessageCircle, Bell, LogOut, UserCircle2 } from "lucide-react";

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
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Link to="/feed" className="text-primary font-semibold text-xl tracking-tighter shrink-0">
              Inkorium
            </Link>
            <div className="relative w-full max-w-sm hidden md:block">
              <Search className="absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar amigos..."
                className="w-full bg-muted rounded-full py-1.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-ring transition outline-none"
              />
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <NavIcon to="/feed" icon={Home} label="Inicio" active={pathname === "/feed"} />
            <NavIcon
              to="/amigos"
              icon={Users}
              label="Amigos"
              active={pathname.startsWith("/amigos")}
              badge={pendingRequests}
            />
            <NavIcon
              to="/mensajes"
              icon={MessageCircle}
              label="Mensajes"
              active={pathname.startsWith("/mensajes")}
              badge={unread}
            />
            <NavIcon
              to="/perfil/$username"
              params={{ username: me?.username ?? "" }}
              icon={UserCircle2}
              label="Mi perfil"
              active={pathname.startsWith("/perfil/") && !!me && pathname === `/perfil/${me.username}`}
            />
            <button
              onClick={handleSignOut}
              title="Salir"
              className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg"
            >
              <LogOut className="size-5" />
            </button>
            <Link
              to="/perfil/$username"
              params={{ username: me?.username ?? "" }}
              className="ml-2 size-8 bg-muted rounded-full overflow-hidden ring-1 ring-border grid place-items-center text-xs font-semibold text-muted-foreground"
            >
              {me?.avatar_url ? (
                <img src={me.avatar_url} alt="" className="size-full object-cover" />
              ) : (
                (me?.display_name?.[0] ?? "?").toUpperCase()
              )}
            </Link>
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  );
}

function NavIcon({
  to,
  params,
  icon: Icon,
  label,
  active,
  badge,
}: {
  to: string;
  params?: Record<string, string>;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  badge?: number;
}) {
  return (
    <Link
      to={to as never}
      params={params as never}
      title={label}
      className={`relative p-2 rounded-lg transition-colors ${
        active ? "text-primary bg-accent" : "text-muted-foreground hover:text-primary"
      }`}
    >
      <Icon className="size-5" />
      {badge && badge > 0 ? (
        <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-destructive text-destructive-foreground text-[10px] font-semibold rounded-full ring-2 ring-surface grid place-items-center">
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
