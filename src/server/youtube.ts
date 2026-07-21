import { createServerFn } from "@tanstack/react-start";

export const searchYoutubeFn = createServerFn({ method: "GET" })
  .validator((query: string) => query)
  .handler(async ({ data: query }) => {
    if (!query) {
      return { results: [], error: "Query is required" };
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error("YOUTUBE_API_KEY is not set in environment variables.");
      return { results: [], error: "Internal Server Error" };
    }

    try {
      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(
          query,
        )}&type=video&videoCategoryId=10&key=${apiKey}`,
      );
      const searchData = await searchRes.json();

      if (!searchRes.ok) {
        throw new Error(searchData.error?.message || "Failed to fetch from YouTube API");
      }

      if (!searchData.items || searchData.items.length === 0) {
        return { results: [] };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");

      const detailsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`,
      );
      const detailsData = await detailsRes.json();

      const durationMap: Record<string, string> = {};
      if (detailsData.items) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        detailsData.items.forEach((item: any) => {
          const match = item.contentDetails.duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
          if (match) {
            const h = match[1] ? parseInt(match[1].replace("H", "")) : 0;
            const m = match[2] ? parseInt(match[2].replace("M", "")) : 0;
            const s = match[3] ? parseInt(match[3].replace("S", "")) : 0;

            let formatted = "";
            if (h > 0) formatted += `${h}:`;
            formatted += `${h > 0 ? m.toString().padStart(2, "0") : m}:`;
            formatted += s.toString().padStart(2, "0");

            durationMap[item.id] = formatted;
          }
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results = searchData.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, "&"),
        artist: item.snippet.channelTitle,
        cover: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        duration: durationMap[item.id.videoId] || "0:00",
      }));

      return { results };
    } catch (error) {
      console.error("YouTube API Error:", error);
      return { results: [], error: "Failed to perform search" };
    }
  });
