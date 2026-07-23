import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Users, Mail, UserPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrganizerProps {
  organizer: {
    id: string;
    display_name: string;
    username: string;
    avatar_url?: string;
    followersCount?: number;
    type?: "persona" | "pagina";
  };
}

export function EventOrganizer({ organizer }: OrganizerProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const avatar =
    organizer?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(organizer?.display_name || "O")}&background=random`;

  if (!organizer) return null;

  return (
    <div className="bg-card rounded-sm border border-[#c2c9d6] p-4 shadow-sm">
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-4">
        ORGANIZADOR DEL EVENTO
      </h4>

      <div className="flex flex-col items-center mb-4">
        <Link to="/perfil/$username" params={{ username: organizer.username }}>
          <img
            src={avatar}
            alt={organizer.display_name}
            className="w-20 h-20 rounded-full object-cover border-2 border-primary/20 mb-3"
          />
        </Link>
        <Link
          to="/perfil/$username"
          params={{ username: organizer.username }}
          className="text-[16px] font-bold text-foreground hover:underline text-center"
        >
          {organizer.display_name}
        </Link>
        <div className="flex items-center gap-2 mt-1 text-[12px] text-muted-foreground">
          <span className="capitalize">{organizer.type || "Organizador"}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Users className="size-3" />
            {organizer.followersCount || 0} seguidores
          </span>
        </div>
      </div>

      <div className="flex gap-2 w-full">
        <Button
          variant={isFollowing ? "outline" : "default"}
          className={`flex-1 h-9 rounded-sm font-bold text-[13px] ${isFollowing ? "text-primary border-primary/50" : ""}`}
          onClick={() => setIsFollowing(!isFollowing)}
        >
          {isFollowing ? (
            <>
              <Check className="size-3.5 mr-1.5" /> Siguiendo
            </>
          ) : (
            <>
              <UserPlus className="size-3.5 mr-1.5" /> Seguir
            </>
          )}
        </Button>
        <Button variant="outline" className="flex-1 h-9 rounded-sm font-bold text-[13px]" asChild>
          <Link to="/mensajes/$username" params={{ username: organizer.username }}>
            <Mail className="size-3.5 mr-1.5" /> Mensaje
          </Link>
        </Button>
      </div>
    </div>
  );
}
