import { Link } from "@tanstack/react-router";
import {
  Heart,
  MessageCircle,
  Trash2,
  PlayCircle,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Share2,
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
    <article className="bg-card rounded-sm border border-[#c2c9d6] shadow-none overflow-hidden">
      <div className="p-5 flex gap-3 pb-3">
        <Avatar profile={post.author} size={40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex items-baseline gap-2">
              <Link
                to="/perfil/$username"
                params={{ username: post.author.username }}
                className="font-bold text-[14px] text-[#0b439c] hover:underline block truncate"
              >
                {post.author.display_name}
              </Link>
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
          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <span>{timeAgo(post.created_at)} -</span> <span className="text-[#0b439c]">@</span>
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-foreground text-pretty whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      </div>

      {post.type === "photo" && post.image_url && (
        <div className="px-5 pb-5">
          <div className="rounded-sm overflow-hidden border border-[#c2c9d6]">
            <img src={post.image_url} alt="Foto" className="w-full max-h-[520px] object-cover" />
          </div>
        </div>
      )}

      {post.type === "video" && post.video_url && (
        <div className="px-5 pb-5">
          <div className="rounded-sm overflow-hidden border border-[#c2c9d6] aspect-video bg-black relative">
            {getYouTubeID(post.video_url) ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeID(post.video_url)}`}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            ) : (
              <video src={post.video_url} controls className="w-full h-full object-contain" />
            )}
          </div>
        </div>
      )}

      {post.type === "music" && post.youtube_id && (
        <div className="pb-4">
          <div className="bg-neutral-900 w-full relative h-[100px] flex overflow-hidden group">
            <div className="w-[100px] h-[100px] shrink-0 relative">
              <img
                src={`https://i.ytimg.com/vi/${post.youtube_id}/hqdefault.jpg`}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center bg-black/20">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center px-4 z-10 space-y-1">
              <h4 className="font-bold text-[16px] text-white truncate leading-tight">
                {post.youtube_title || "Mr. Brightside"}
              </h4>
              <p className="text-[13px] text-[#A3A3A3] truncate">
                {post.youtube_channel || "The Killers"}
              </p>
            </div>
            <div className="absolute bottom-2 right-3 z-10 text-[#404040] text-[11px] font-medium">
              © YouTube
            </div>
          </div>
        </div>
      )}

      {post.type === "event" && post.event && (
        <div className="px-5 pb-5">
          <div className="rounded-sm border border-[#c2c9d6] bg-accent/20 overflow-hidden">
            <div className="bg-[#0b439c] text-white p-3">
              <h4 className="font-bold text-sm truncate">{String(post.event.name || "")}</h4>
            </div>
            <div className="p-3 text-sm space-y-2">
              <div className="flex gap-2 text-muted-foreground">
                <CalendarIcon className="size-4 text-[#0b439c]" />{" "}
                {String(post.event.event_date || "")}
              </div>
              <div className="flex gap-2 text-muted-foreground">
                <Clock className="size-4 text-[#0b439c]" /> {String(post.event.event_time || "")}
              </div>
              <div className="flex gap-2 text-muted-foreground">
                <MapPin className="size-4 text-[#0b439c]" />{" "}
                {String(post.event.location || "Sin ubicación")}
              </div>
            </div>
          </div>
        </div>
      )}

      {post.type === "news" && (
        <div className="px-5 pb-5">
          <div className="rounded-sm border border-[#c2c9d6] overflow-hidden cursor-pointer hover:bg-secondary transition-colors">
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

      <div className="flex justify-between px-5 py-3 mt-2">
        <div className="flex gap-6">
          <button
            onClick={() => like.mutate()}
            disabled={like.isPending}
            className={`flex items-center gap-1.5 text-[13px] font-bold transition-colors ${
              post.liked_by_me ? "text-[#0b439c]" : "text-[#a9a9a9] hover:text-[#0b439c]"
            }`}
          >
            <Heart className={`size-4 ${post.liked_by_me ? "fill-[#2F5FA7]" : "text-[#a9a9a9]"}`} />
            Me gusta
          </button>
          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 text-[13px] font-bold text-[#a9a9a9] hover:text-[#0b439c] transition-colors"
          >
            <MessageCircle className="size-4" />
            Comentar
          </button>
          <button className="flex items-center gap-1.5 text-[13px] font-bold text-[#a9a9a9] hover:text-[#0b439c] transition-colors">
            <Share2 className="size-4" />
            Compartir
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[13px] text-[#a9a9a9] font-bold">
          <Heart className="size-4" />
          {post.like_count}
        </div>
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
      className="rounded-full overflow-hidden shrink-0 border border-[#c2c9d6] bg-muted grid place-items-center text-xs font-bold text-[#0b439c]"
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
    <div className="px-5 pb-5 space-y-3 pt-3 bg-secondary/30">
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
            <div className="flex-1 bg-surface rounded-lg px-3 py-2 text-[13px] border border-[#c2c9d6]">
              <Link
                to="/perfil/$username"
                params={{ username: author.username }}
                className="font-bold text-[#0b439c] hover:underline mr-1.5"
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
          className="flex-1 bg-surface border border-[#c2c9d6] rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={!text.trim() || add.isPending}
          className="text-xs font-bold bg-[#0b439c] hover:bg-[#0b439c] text-white px-4 rounded-lg disabled:opacity-40 transition-colors"
        >
          Comentar
        </button>
      </form>
    </div>
  );
}
