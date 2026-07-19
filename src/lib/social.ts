import { supabase } from "@/integrations/supabase/client";

export type ProfileLite = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

export type FeedPost = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author: ProfileLite;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
  type: "status" | "photo" | "video" | "music" | "event" | "news";
  video_url?: string;
  youtube_id?: string;
  youtube_title?: string;
  youtube_channel?: string;
  youtube_duration?: string;
  news_title?: string;
  news_content?: string;
  event_id?: string;
  event?: Record<string, unknown>; // To store joined event data if needed
};

export async function fetchFeed(currentUserId: string): Promise<FeedPost[]> {
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      "id, content, image_url, type, video_url, youtube_id, youtube_title, youtube_channel, youtube_duration, news_title, news_content, event_id, event, created_at, author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url)",
    )
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  if (!posts || posts.length === 0) return [];

  const ids = posts.map((p) => p.id);
  const [likesRes, commentsRes, myLikesRes] = await Promise.all([
    supabase.from("likes").select("post_id").in("post_id", ids),
    supabase.from("comments").select("post_id").in("post_id", ids),
    supabase.from("likes").select("post_id").in("post_id", ids).eq("user_id", currentUserId),
  ]);

  const likeCounts = new Map<string, number>();
  likesRes.data?.forEach((l) => likeCounts.set(l.post_id, (likeCounts.get(l.post_id) ?? 0) + 1));
  const commentCounts = new Map<string, number>();
  commentsRes.data?.forEach((c) =>
    commentCounts.set(c.post_id, (commentCounts.get(c.post_id) ?? 0) + 1),
  );
  const myLiked = new Set(myLikesRes.data?.map((l) => l.post_id) ?? []);

  return posts.map(
    (
      p: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    ) => ({
      id: p.id,
      content: p.content,
      image_url: p.image_url,
      created_at: p.created_at,
      type: (p.type || "status") as "status" | "photo" | "video" | "music" | "event" | "news",
      video_url: p.video_url,
      youtube_id: p.youtube_id,
      youtube_title: p.youtube_title,
      youtube_channel: p.youtube_channel,
      youtube_duration: p.youtube_duration,
      news_title: p.news_title,
      news_content: p.news_content,
      event_id: p.event_id,
      event: p.event,
      author: p.author as unknown as ProfileLite,
      like_count: likeCounts.get(p.id) ?? 0,
      comment_count: commentCounts.get(p.id) ?? 0,
      liked_by_me: myLiked.has(p.id),
    }),
  );
}

export function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "ahora";
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
