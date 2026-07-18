with open("src/routes/_authenticated/feed.tsx", "r") as f:
    content = f.read()

import_react = 'import { useState'
import_react_new = 'import { useState, useRef'
content = content.replace(import_react, import_react_new)

old_state = 'const [extraData, setExtraData] = useState<Record<string, string>>({});'
new_state = """  const [extraData, setExtraData] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const ext = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from("media")
        .upload(`posts/${fileName}`, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("media")
        .getPublicUrl(`posts/${fileName}`);

      setMediaUrl(publicUrlData.publicUrl);
      toast.success("Archivo subido correctamente");
    } catch (err) {
      toast.error("Error al subir archivo");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };"""

content = content.replace(old_state, new_state)

old_photo_btn = """              <button
                type="button"
                className="bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-border"
              >
                <Upload className="size-4" />
                Subir
              </button>"""

new_photo_btn = """              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-border disabled:opacity-50"
              >
                <Upload className="size-4" />
                {isUploading ? "Subiendo..." : "Subir"}
              </button>"""

content = content.replace(old_photo_btn, new_photo_btn)

hidden_input = """        <div className="flex-1 space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*"
            onChange={handleFileUpload}
          />"""

content = content.replace('<div className="flex-1 space-y-3">', hidden_input)

with open("src/routes/_authenticated/feed.tsx", "w") as f:
    f.write(content)

print("Replaced successfully!")
