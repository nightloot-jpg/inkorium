import { Link } from "@tanstack/react-router";
import {
  Heart,
  MessageCircle,
  Trash2,
  PlayCircle,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
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
                className="font-bold text-[14px] text-[#2F5FA7] hover:underline block truncate"
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
          <p className="mt-2 text-[14px] leading-relaxed text-foreground text-pretty whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      </div>

      {post.type === "photo" && post.image_url && (
        <div className="px-4 pb-4">
          <div className="rounded-xl overflow-hidden ring-1 ring-border">
            <img src={post.image_url} alt="Foto" className="w-full max-h-[520px] object-cover" />
          </div>
        </div>
      )}

      {post.type === "video" && post.video_url && (
        <div className="px-4 pb-4">
          <div className="rounded-xl overflow-hidden ring-1 ring-border aspect-video bg-black relative">
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeID(post.video_url)}`}
              className="w-full h-full"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {post.type === "music" && post.youtube_id && (
        <div className="px-4 pb-4">
          <div className="rounded-xl ring-1 ring-border p-3 flex gap-4 bg-[#f8f9fa] items-center">
            <div className="w-20 h-20 bg-muted rounded-md shrink-0 relative overflow-hidden flex items-center justify-center">
              <img
                src={`https://i.ytimg.com/vi/${post.youtube_id}/hqdefault.jpg`}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <PlayCircle className="size-8 text-white absolute bg-black/30 rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm truncate">
                {post.youtube_title || "Canción desconocida"}
              </h4>
              <p className="text-xs text-muted-foreground truncate">YouTube Music</p>
              <div className="mt-2 h-1 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-[#2F5FA7] w-1/3"></div>
              </div>
            </div>
            <button className="text-red-500 font-bold text-xs shrink-0 flex flex-col items-center gap-1">
              <PlayCircle className="size-6" /> YouTube
            </button>
          </div>
        </div>
      )}

      {post.type === "event" && post.event && (
        <div className="px-4 pb-4">
          <div className="rounded-xl ring-1 ring-border bg-accent/20 overflow-hidden">
            <div className="bg-[#2F5FA7] text-white p-3">
              <h4 className="font-bold text-sm truncate">{String(post.event.name || "")}</h4>
            </div>
            <div className="p-3 text-sm space-y-2">
              <div className="flex gap-2 text-muted-foreground">
                <CalendarIcon className="size-4 text-[#2F5FA7]" />{" "}
                {String(post.event.event_date || "")}
              </div>
              <div className="flex gap-2 text-muted-foreground">
                <Clock className="size-4 text-[#2F5FA7]" /> {String(post.event.event_time || "")}
              </div>
              <div className="flex gap-2 text-muted-foreground">
                <MapPin className="size-4 text-[#2F5FA7]" />{" "}
                {String(post.event.location || "Sin ubicación")}
              </div>
            </div>
          </div>
        </div>
      )}

      {post.type === "news" && (
        <div className="px-4 pb-4">
          <div className="rounded-xl ring-1 ring-border overflow-hidden cursor-pointer hover:bg-secondary transition-colors">
            {post.image_url && (
              <img src={post.image_url} alt="Noticia" className="w-full h-40 object-cover" />
            )}
            <div className="p-3">
              <h4 className="font-bold text-sm mb-1">{post.news_title}</h4>
              <p className="text-xs text-muted-foreground">Fuente: inkorium.com</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 px-4 py-2 bg-secondary/30 border-t border-border">
        <button
          onClick={() => like.mutate()}
          disabled={like.isPending}
          className={`flex items-center gap-1.5 text-xs font-bold py-1.5 px-2 rounded-md transition-colors ${
            post.liked_by_me ? "text-[#2F5FA7]" : "text-muted-foreground hover:text-[#2F5FA7]"
          }`}
        >
          <Heart className={`size-4 ${post.liked_by_me ? "fill-[#2F5FA7]" : ""}`} />
          {post.like_count} Me gusta
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-bold py-1.5 px-2 rounded-md text-muted-foreground hover:text-[#2F5FA7] transition-colors"
        >
          <MessageCircle className="size-4" />
          {post.comment_count} Comentarios
        </button>
      </div>

      {showComments && <Comments postId={post.id} currentUserId={currentUserId} />}
    </article>
  );
}

function getYouTubeID(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
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
      className="rounded-lg overflow-hidden shrink-0 ring-1 ring-border bg-muted grid place-items-center text-xs font-bold text-[#2F5FA7]"
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
        .select(
          "id, content, created_at, author:profiles!comments_author_id_fkey(id, username, display_name, avatar_url)",
        )
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
    <div className="px-4 pb-4 space-y-3 pt-3 bg-secondary/30">
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
            <div className="flex-1 bg-surface rounded-lg px-3 py-2 text-[13px] ring-1 ring-border">
              <Link
                to="/perfil/$username"
                params={{ username: author.username }}
                className="font-bold text-[#2F5FA7] hover:underline mr-1.5"
              >
                {author.display_name}
              </Link>
              <span className="text-foreground whitespace-pre-wrap">{c.content}</span>
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
          className="flex-1 bg-surface ring-1 ring-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={!text.trim() || add.isPending}
          className="text-xs font-bold bg-[#2F5FA7] hover:bg-[#264d87] text-white px-4 rounded-lg disabled:opacity-40 transition-colors"
        >
          Comentar
        </button>
      </form>
    </div>
  );
}
