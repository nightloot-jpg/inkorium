import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type FeedPost, timeAgo, initials } from "@/lib/social";
import { toast } from "sonner";

export function PostCard({ post, currentUserId }: { post: FeedPost; currentUserId: string }) {
  const qc = useQueryClient();
  const [showComments, setShowComments] = useState(false);

  const like = useMutation({
    mutationFn: async () => {
      if (post.liked_by_me) {
        await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUserId);
      } else {
        await supabase.from("likes").insert({ post_id: post.id, user_id: currentUserId });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("posts").delete().eq("id", post.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Publicación borrada");
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  return (
    <article className="bg-card rounded-2xl ring-1 ring-border shadow-card overflow-hidden">
      <div className="p-4 flex gap-3">
        <Avatar profile={post.author} size={40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <Link
                to="/perfil/$username"
                params={{ username: post.author.username }}
                className="font-medium text-sm hover:underline block truncate"
              >
                {post.author.display_name}
              </Link>
              <span className="text-[11px] text-muted-foreground">{timeAgo(post.created_at)}</span>
            </div>
            {post.author.id === currentUserId && (
              <button
                onClick={() => remove.mutate()}
                className="p-1.5 text-muted-foreground hover:text-destructive rounded-md transition-colors"
                title="Borrar"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground text-pretty whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      </div>

      {post.image_url && (
        <div className="px-4 pb-4">
          <div className="rounded-xl overflow-hidden ring-1 ring-border">
            <img src={post.image_url} alt="" className="w-full max-h-[520px] object-cover" />
          </div>
        </div>
      )}

      <div className="flex gap-4 px-4 py-2 border-t border-border">
        <button
          onClick={() => like.mutate()}
          disabled={like.isPending}
          className={`flex items-center gap-1.5 text-xs font-medium py-1.5 px-2 rounded-md transition-colors ${
            post.liked_by_me ? "text-primary" : "text-muted-foreground hover:text-primary"
          }`}
        >
          <Heart className={`size-4 ${post.liked_by_me ? "fill-primary" : ""}`} />
          {post.like_count} Me gusta
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium py-1.5 px-2 rounded-md text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="size-4" />
          {post.comment_count} Comentarios
        </button>
      </div>

      {showComments && <Comments postId={post.id} currentUserId={currentUserId} />}
    </article>
  );
}

export function Avatar({
  profile,
  size = 40,
}: {
  profile: { display_name: string; avatar_url: string | null } | null | undefined;
  size?: number;
}) {
  return (
    <div
      className="rounded-full overflow-hidden shrink-0 ring-1 ring-border bg-muted grid place-items-center text-xs font-semibold text-muted-foreground"
      style={{ width: size, height: size }}
    >
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt="" className="size-full object-cover" />
      ) : (
        initials(profile?.display_name)
      )}
    </div>
  );
}

function Comments({ postId, currentUserId }: { postId: string; currentUserId: string }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const { data: comments = [] } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, content, created_at, author:profiles!comments_author_id_fkey(id, username, display_name, avatar_url)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const content = text.trim();
      if (!content) return;
      const { error } = await supabase
        .from("comments")
        .insert({ post_id: postId, author_id: currentUserId, content });
      if (error) throw error;
    },
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["comments", postId] });
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  return (
    <div className="px-4 pb-4 space-y-3 border-t border-border pt-3 bg-secondary/30">
      {comments.length === 0 && (
        <p className="text-xs text-muted-foreground italic">Sé el primero en comentar.</p>
      )}
      {comments.map((c) => {
        const author = c.author as unknown as {
          username: string;
          display_name: string;
          avatar_url: string | null;
        };
        return (
          <div key={c.id} className="flex gap-2">
            <Avatar profile={author} size={28} />
            <div className="flex-1 bg-surface rounded-xl px-3 py-2 text-sm">
              <Link
                to="/perfil/$username"
                params={{ username: author.username }}
                className="font-medium text-xs hover:underline"
              >
                {author.display_name}
              </Link>
              <p className="text-[13px] text-foreground whitespace-pre-wrap">{c.content}</p>
            </div>
          </div>
        );
      })}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
        className="flex gap-2 pt-1"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1 bg-surface ring-1 ring-border rounded-full text-sm px-3 py-1.5 outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={!text.trim() || add.isPending}
          className="text-xs font-medium text-primary px-3 disabled:opacity-40"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
