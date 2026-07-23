import React, { useState } from "react";
import { Download, X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

interface EventGalleryProps {
  images: string[];
}

export function EventGallery({ images }: EventGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => {
    setSelectedIdx(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedIdx(null);
    document.body.style.overflow = "auto";
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx - 1 + images.length) % images.length);
    }
  };

  return (
    <>
      <div className="bg-card rounded-sm border border-[#c2c9d6] p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <ImageIcon className="size-5" />
          Galería
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div
              key={i}
              className="aspect-square rounded-sm overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => openLightbox(i)}
            >
              <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {selectedIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-center items-center backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div className="absolute top-4 right-4 flex gap-4">
            <a
              href={images[selectedIdx]}
              download={`event-img-${selectedIdx}.jpg`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="text-white hover:text-white/80 p-2"
            >
              <Download className="size-6" />
            </a>
            <button onClick={closeLightbox} className="text-white hover:text-white/80 p-2">
              <X className="size-6" />
            </button>
          </div>

          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80 p-2"
          >
            <ChevronLeft className="size-10" />
          </button>

          <img
            src={images[selectedIdx]}
            alt={`Gallery view`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-sm"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80 p-2"
          >
            <ChevronRight className="size-10" />
          </button>

          <div className="absolute bottom-4 text-white/80 font-medium">
            {selectedIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
