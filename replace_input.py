with open("src/routes/_authenticated/feed.tsx", "r") as f:
    content = f.read()

old_photo_block = """          {activeTab === "photo" && (
            <input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="URL de la imagen..."
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          )}"""

new_photo_block = """          {activeTab === "photo" && (
            <div className="flex gap-2">
              <input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="URL de la imagen..."
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                className="bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-border"
              >
                <Upload className="size-4" />
                Subir
              </button>
            </div>
          )}"""

old_video_block = """          {activeTab === "video" && (
            <input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="URL del vídeo de YouTube..."
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          )}"""

new_video_block = """          {activeTab === "video" && (
            <div className="flex gap-2">
              <input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="URL del vídeo de YouTube..."
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                className="bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-border"
              >
                <Upload className="size-4" />
                Subir
              </button>
            </div>
          )}"""

content = content.replace(old_photo_block, new_photo_block)
content = content.replace(old_video_block, new_video_block)

with open("src/routes/_authenticated/feed.tsx", "w") as f:
    f.write(content)

print("Replaced successfully!")
