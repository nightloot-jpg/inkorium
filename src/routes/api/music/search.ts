import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/music/search")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get("q");

        if (!query) {
          return Response.json({ error: 'Query parameter "q" is required' }, { status: 400 });
        }

        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
          console.error("YOUTUBE_API_KEY is not set in environment variables.");
          return Response.json({ error: "Internal Server Error" }, { status: 500 });
        }

        try {
          // 1. Search for videos
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
            return Response.json({ results: [] });
          }

          // Extract video IDs to fetch durations
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");

          // 2. Fetch video details to get duration
          const detailsRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`,
          );
          const detailsData = await detailsRes.json();

          if (!detailsRes.ok) {
            console.error("Failed to fetch video details:", detailsData.error?.message);
            // Gracefully fallback to no duration
          }

          const durationMap: Record<string, string> = {};
          if (detailsData.items) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            detailsData.items.forEach((item: any) => {
              // Convert ISO 8601 duration (e.g., PT3M42S) to readable format (e.g., 3:42)
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

          // 3. Map results
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

          return Response.json({ results });
        } catch (error) {
          console.error("YouTube API Error:", error);
          return Response.json({ error: "Failed to perform search" }, { status: 500 });
        }
      },
    },
  },
});
