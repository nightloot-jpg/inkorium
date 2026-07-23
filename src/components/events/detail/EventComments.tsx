import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/post-card";
import { fetchFeed } from "@/lib/social";
import { Button } from "@/components/ui/button";
import { ImageIcon, Video, Music } from "lucide-react";
import { Route as AuthRoute } from "@/routes/_authenticated/route";

interface EventCommentsProps {
  eventId: string;
}

export function EventComments({ eventId }: EventCommentsProps) {
  const queryClient = useQueryClient();
  const auth = AuthRoute.useRouteContext();
  const currentUserId = auth.userId;
  const { data: user } = useQuery({
    queryKey: ["profile", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUserId)
        .maybeSingle();
      return data;
    },
  });

  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["event_posts", eventId],
    queryFn: async () => {
      // For now we'll fetch general feed and filter in UI, or just rely on a specific call if we update fetchFeed
      // But fetchFeed is for feed. Let's create a custom query here for this event.
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          author:profiles(*),
          likes(user_id),
          comments(count)
        `,
        )
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform similar to fetchFeed logic
      const userLikesData = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", currentUserId);
      const userLikes = new Set((userLikesData.data || []).map((l) => l.post_id));

      return data.map((p: any) => ({
        ...p,
        likes_count: p.likes?.length || 0,
        comments_count: p.comments?.[0]?.count || 0,
        user_has_liked: userLikes.has(p.id),
      }));
    },
    enabled: !!eventId,
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId || !content.trim()) return;
      // Handle youtube URLs
      let finalType: "status" | "photo" | "video" = "status";
      let ytId = null;
      let finalVideoUrl = videoUrl || null;
      const finalImageUrl = imageUrl || null;

      if (finalImageUrl) finalType = "photo";
      if (finalVideoUrl) {
        finalType = "video";
        const ytMatch = finalVideoUrl.match(
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
        );
        if (ytMatch) {
          ytId = ytMatch[1];
          finalVideoUrl = null; // Use youtube_id instead
        }
      }

      const { error } = await supabase.from("posts").insert({
        author_id: currentUserId,
        content: content.trim(),
        type: finalType,
        image_url: finalImageUrl,
        video_url: finalVideoUrl,
        youtube_id: ytId,
        youtube_title: null,
        youtube_channel: null,
        youtube_duration: null,
        news_title: null,
        news_content: null,
        event_id: eventId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setContent("");
      setImageUrl("");
      setVideoUrl("");
      queryClient.invalidateQueries({ queryKey: ["event_posts", eventId] });
    },
  });

  return (
    <div className="flex flex-col gap-4 mt-6">
      <h2 className="text-xl font-bold text-foreground mb-2">Comentarios</h2>

      {/* Create Comment box (similar to feed) */}
      <div className="bg-card rounded-sm border border-[#c2c9d6] p-4 shadow-sm">
        <div className="flex gap-3">
          <img
            src={
              user?.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.display_name || "User")}`
            }
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <div className="flex flex-col flex-1 gap-3">
            <textarea
              className="w-full bg-transparent border-none resize-none focus:outline-none text-[15px] min-h-[60px]"
              placeholder="¿Qué opinas sobre este evento?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {imageUrl && (
              <div className="relative mt-2">
                <img src={imageUrl} className="max-h-40 rounded object-cover" />
                <button
                  onClick={() => setImageUrl("")}
                  className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full text-xs"
                >
                  X
                </button>
              </div>
            )}
            {videoUrl && (
              <div className="relative mt-2 p-2 bg-secondary rounded text-xs truncate">
                Vídeo adjunto: {videoUrl}
                <button
                  onClick={() => setVideoUrl("")}
                  className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full text-xs"
                >
                  X
                </button>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <div className="flex gap-1">
                <Button
                  onClick={() => {
                    const url = prompt("Introduce la URL de la imagen:");
                    if (url) setImageUrl(url);
                  }}
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-full ${imageUrl ? "text-primary" : "text-primary/80 hover:text-primary"}`}
                >
                  <ImageIcon className="size-4" />
                </Button>
                <Button
                  onClick={() => {
                    const url = prompt("Introduce la URL del vídeo (YouTube, MP4):");
                    if (url) setVideoUrl(url);
                  }}
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-full ${videoUrl ? "text-primary" : "text-primary/80 hover:text-primary"}`}
                >
                  <Video className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary/80 hover:text-primary rounded-full"
                >
                  <Music className="size-4" />
                </Button>
              </div>
              <Button
                onClick={() => createPostMutation.mutate()}
                disabled={!content.trim() || createPostMutation.isPending}
                className="h-8 text-[13px] font-bold px-4 rounded-sm"
              >
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Cargando comentarios...
          </div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} currentUserId={currentUserId} />)
        ) : (
          <div className="bg-card rounded-sm border border-[#c2c9d6] p-8 text-center text-muted-foreground shadow-sm">
            No hay comentarios todavía. ¡Sé el primero en opinar!
          </div>
        )}
      </div>
    </div>
  );
}
