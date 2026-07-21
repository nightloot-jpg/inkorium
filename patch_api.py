import re

with open("src/routes/api/music/search.ts", "r") as f:
    content = f.read()

mock_data = """
          console.warn("YOUTUBE_API_KEY is not set in environment variables. Returning mock data.");
          return Response.json({
            results: [
              {
                id: "gGdGFtwcGzc",
                title: "Mr. Brightside",
                artist: "The Killers",
                cover: "https://i.ytimg.com/vi/gGdGFtwcGzc/hqdefault.jpg",
                duration: "3:48"
              },
              {
                id: "1w7OgIMMRc4",
                title: "Sweet Child O' Mine",
                artist: "Guns N' Roses",
                cover: "https://i.ytimg.com/vi/1w7OgIMMRc4/hqdefault.jpg",
                duration: "5:03"
              }
            ]
          });
"""

content = content.replace(
    'console.error("YOUTUBE_API_KEY is not set in environment variables.");\n          return Response.json({ error: "Internal Server Error" }, { status: 500 });',
    mock_data
)

with open("src/routes/api/music/search.ts", "w") as f:
    f.write(content)
