import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Route as AuthRoute } from "./route";
import { Avatar } from "@/components/post-card";
import { UserPlus, Check, X, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/amigos")({
  head: () => ({ meta: [{ title: "Amigos — Inkorium" }] }),
  component: FriendsPage,
});

type Profile = { id: string; username: string; display_name: string; avatar_url: string | null };

function FriendsPage() {
  const { userId } = AuthRoute.useRouteContext();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"friends" | "requests" | "discover">("friends");

  const { data: friends = [] } = useQuery({
    queryKey: ["friends-all", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("friendships")
        .select("requester_id, addressee_id, requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url), addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, avatar_url)")
        .eq("status", "accepted")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
      return (data ?? []).map((r) => (r.requester_id === userId ? r.addressee : r.requester) as unknown as Profile);
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["requests-all", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("friendships")
        .select("id, requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url)")
        .eq("addressee_id", userId)
        .eq("status", "pending");
      return data ?? [];
    },
  });

  const { data: discover = [] } = useQuery({
    queryKey: ["discover-all", userId],
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
        .limit(30);
      return data ?? [];
    },
  });

  const respond = useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) => {
      if (accept) await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
      else await supabase.from("friendships").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries(),
  });

  const send = useMutation({
    mutationFn: async (addresseeId: string) => {
      const { error } = await supabase
        .from("friendships")
        .insert({ requester_id: userId, addressee_id: addresseeId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Solicitud enviada");
      qc.invalidateQueries();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Amigos</h1>

      <div className="flex gap-1 bg-card p-1 rounded-xl ring-1 ring-border w-fit">
        {(
          [
            ["friends", `Amigos (${friends.length})`],
            ["requests", `Solicitudes (${requests.length})`],
            ["discover", "Descubrir"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-2xl ring-1 ring-border p-4 space-y-2">
        {tab === "friends" && (
          <>
            {friends.length === 0 && <Empty label="Aún no tienes amigos. Ve a Descubrir." />}
            {friends.map((f) => (
              <Row key={f.id} profile={f}>
                <Link
                  to="/mensajes/$username"
                  params={{ username: f.username }}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-secondary hover:bg-muted text-secondary-foreground px-2 py-1.5 rounded-md"
                >
                  <MessageCircle className="size-3.5" /> Mensaje
                </Link>
              </Row>
            ))}
          </>
        )}
        {tab === "requests" && (
          <>
            {requests.length === 0 && <Empty label="Sin solicitudes pendientes." />}
            {requests.map((r) => {
              const req = r.requester as unknown as Profile;
              return (
                <Row key={r.id} profile={req}>
                  <button
                    onClick={() => respond.mutate({ id: r.id, accept: true })}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover px-2 py-1.5 rounded-md"
                  >
                    <Check className="size-3.5" /> Aceptar
                  </button>
                  <button
                    onClick={() => respond.mutate({ id: r.id, accept: false })}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-secondary hover:bg-muted text-secondary-foreground px-2 py-1.5 rounded-md"
                  >
                    <X className="size-3.5" />
                  </button>
                </Row>
              );
            })}
          </>
        )}
        {tab === "discover" && (
          <>
            {discover.length === 0 && <Empty label="No hay nadie nuevo por ahora." />}
            {discover.map((p) => (
              <Row key={p.id} profile={p}>
                <button
                  onClick={() => send.mutate(p.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover px-2 py-1.5 rounded-md"
                >
                  <UserPlus className="size-3.5" /> Añadir
                </button>
              </Row>
            ))}
          </>
        )}
      </div>
    </main>
  );
}

function Row({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0">
      <Link
        to="/perfil/$username"
        params={{ username: profile.username }}
        className="flex items-center gap-3 min-w-0 hover:underline"
      >
        <Avatar profile={profile} size={40} />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{profile.display_name}</p>
          <p className="text-xs text-muted-foreground">@{profile.username}</p>
        </div>
      </Link>
      <div className="flex gap-1 shrink-0">{children}</div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground italic py-4 text-center">{label}</p>;
}
