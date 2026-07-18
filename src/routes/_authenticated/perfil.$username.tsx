import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchFeed, initials } from "@/lib/social";
import { PostCard, Avatar } from "@/components/post-card";
import { Route as AuthRoute } from "./route";
import { useState } from "react";
import { UserPlus, MessageCircle, Check, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

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
        .select("id, username, display_name, bio, avatar_url, created_at")
        .eq("username", username)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return data;
    },
  });

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

  if (isLoading)
    return <p className="text-center py-16 text-sm text-muted-foreground">Cargando...</p>;
  if (!profile) return null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-card rounded-2xl ring-1 ring-border shadow-card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary via-primary to-primary/60" />
        <div className="p-6 pt-0 flex flex-col md:flex-row md:items-end gap-4 -mt-10">
          <div className="size-24 rounded-2xl overflow-hidden ring-4 ring-card bg-muted grid place-items-center text-2xl font-semibold text-muted-foreground shrink-0">
            {profile.avatar_url ? (
              /* ⚡ Bolt: added loading="lazy" to defer offscreen images */
              <img
                src={profile.avatar_url}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            ) : (
              initials(profile.display_name)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{profile.display_name}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            {profile.bio && (
              <p className="mt-2 text-sm text-foreground text-pretty">{profile.bio}</p>
            )}
          </div>
          <div className="flex gap-2">
            {isMe ? (
              <EditProfileButton profile={profile} />
            ) : friendship?.status === "accepted" ? (
              <Link
                to="/mensajes/$username"
                params={{ username: profile.username }}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium py-2 px-4 rounded-lg"
              >
                <MessageCircle className="size-4" /> Mensaje
              </Link>
            ) : friendship?.status === "pending" && friendship.addressee_id === userId ? (
              <>
                <button
                  onClick={() => acceptReq.mutate()}
                  className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-sm font-medium py-2 px-4 rounded-lg hover:bg-primary-hover"
                >
                  <Check className="size-4" /> Aceptar
                </button>
                <button
                  onClick={() => removeReq.mutate()}
                  className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-sm py-2 px-4 rounded-lg hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              </>
            ) : friendship?.status === "pending" ? (
              <button
                onClick={() => removeReq.mutate()}
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground text-sm py-2 px-4 rounded-lg hover:bg-muted"
              >
                Solicitud enviada
              </button>
            ) : (
              <button
                onClick={() => sendReq.mutate()}
                disabled={sendReq.isPending}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-2 px-4 rounded-lg hover:bg-primary-hover"
              >
                <UserPlus className="size-4" /> Añadir amigo
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Publicaciones
        </h2>
        <div className="space-y-4">
          {feed.length === 0 && (
            <div className="bg-card rounded-2xl ring-1 ring-border p-6 text-center text-sm text-muted-foreground">
              Aún no ha publicado nada.
            </div>
          )}
          {feed.map((p) => (
            <PostCard key={p.id} post={p} currentUserId={userId} />
          ))}
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
        className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground text-sm py-2 px-4 rounded-lg hover:bg-muted"
      >
        <Pencil className="size-4" /> Editar perfil
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
            className="bg-primary text-primary-foreground px-4 py-2 text-sm rounded-lg hover:bg-primary-hover"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
