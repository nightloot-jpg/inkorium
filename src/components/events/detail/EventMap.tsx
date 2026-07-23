import React from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventMapProps {
  location: string;
  city: string;
}

export function EventMap({ location, city }: EventMapProps) {
  const query = encodeURIComponent(`${location}, ${city}`);

  return (
    <div className="bg-card rounded-sm border border-[#c2c9d6] p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground">Ubicación</h2>
        <Button variant="outline" size="sm" className="gap-2 text-[13px] h-8" asChild>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${query}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin className="size-3.5" />
            Cómo llegar
          </a>
        </Button>
      </div>

      <p className="text-[14px] text-muted-foreground font-medium mb-4">
        {location}, {city}
      </p>

      <div className="w-full h-[300px] rounded-md overflow-hidden bg-muted">
        <iframe
          title="Event Location"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={`https://www.google.com/maps/embed/v1/place?key=FAKE_API_KEY_FOR_DEMO&q=${query}`}
        ></iframe>
      </div>
    </div>
  );
}
