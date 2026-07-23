import React from "react";
import { Link } from "@tanstack/react-router";
import { EventCard } from "../EventCard";
import {
  Calendar,
  MapPin,
  Link as LinkIcon,
  Share2,
  Info,
  Clock,
  Globe,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventRightSidebarProps {
  organizer: any;
  relatedEvents: any[];
  eventData: any;
  attendees: any[];
}

export function EventRightSidebar({ organizer, relatedEvents, eventData, attendees }: EventRightSidebarProps) {

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(eventData.title + " " + window.location.href)}`, "_blank");
  };

  const handleShareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(eventData.title)}`, "_blank");
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank");
  };

  const handleShareX = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(eventData.title)}`, "_blank");
  };

  return (
    <aside className="space-y-6 hidden xl:block w-[300px] shrink-0">

      {/* Organizer Profile */}
      {organizer && (
        <div className="bg-card rounded-sm border border-[#c2c9d6] p-5 shadow-sm text-center flex flex-col items-center">
          <img
            src={
              organizer.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(organizer.display_name)}&background=random`
            }
            alt={organizer.display_name}
            className="w-20 h-20 rounded-full object-cover mb-3"
          />
          <h4 className="text-[16px] font-bold text-foreground">{organizer.display_name}</h4>
          <p className="text-[13px] text-muted-foreground mb-4 line-clamp-2">
            {organizer.bio || "Organizador de eventos en Inkorium"}
          </p>
          <Link to="/perfil/$username" params={{ username: organizer.username }} className="w-full">
            <Button variant="outline" className="w-full font-bold h-9 text-[13px]">
              Ver perfil
            </Button>
          </Link>
        </div>
      )}

      {/* Organizer Next Events */}
      {relatedEvents && relatedEvents.length > 0 && (
        <div className="bg-card rounded-sm border border-[#c2c9d6] p-5 shadow-sm">
          <h4 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
            <Calendar className="size-4" />
            Próximos eventos
          </h4>
          <div className="flex flex-col gap-3">
            {relatedEvents.map((ev) => (
              <div key={ev.id} className="flex gap-3 group">
                <img src={ev.cover} alt={ev.title} className="w-[60px] h-[60px] rounded object-cover border border-border shrink-0" />
                <div className="flex flex-col flex-1 min-w-0 justify-center">
                  <span className="text-[13px] font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    <Link to="/eventos/$id" params={{ id: ev.id }}>{ev.title}</Link>
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    {new Date(ev.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* People attending (detailed) */}
      <div className="bg-card rounded-sm border border-[#c2c9d6] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide">
            Asistentes
          </h4>
          <span className="text-[12px] text-primary font-medium">{attendees.length} personas</span>
        </div>

        {attendees.length > 0 ? (
          <div className="flex flex-col gap-3">
            {attendees.slice(0, 5).map((att) => (
              <div key={att.id} className="flex items-center gap-3">
                <Link to="/perfil/$username" params={{ username: att.username }}>
                  <img
                    src={att.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(att.name)}&background=random`}
                    alt={att.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </Link>
                <div className="flex flex-col min-w-0 flex-1">
                  <Link to="/perfil/$username" params={{ username: att.username }} className="text-[13px] font-medium text-foreground hover:underline truncate">
                    {att.name}
                  </Link>
                  <span className="text-[11px] text-muted-foreground truncate">
                    Madrid
                  </span>
                </div>
              </div>
            ))}
            {attendees.length > 5 && (
              <Button variant="ghost" className="w-full h-8 text-[12px] mt-1 text-primary">
                Ver todos
              </Button>
            )}
          </div>
        ) : (
          <p className="text-[13px] text-muted-foreground">Nadie ha confirmado asistencia aún.</p>
        )}
      </div>

      {/* Additional Info */}
      <div className="bg-card rounded-sm border border-[#c2c9d6] p-5 shadow-sm">
        <h4 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
          <Info className="size-4" />
          Información Adicional
        </h4>

        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="size-3.5" /> Creado</span>
            <span className="font-medium">{new Date(eventData.created_at || Date.now()).toLocaleDateString("es-ES")}</span>
          </div>
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="size-3.5" /> Últ. actualiz.</span>
            <span className="font-medium">Hoy</span>
          </div>
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-muted-foreground flex items-center gap-1.5"><Globe className="size-3.5" /> Idioma</span>
            <span className="font-medium">Español</span>
          </div>

          {eventData.tags && eventData.tags.length > 0 && (
            <div className="mt-2 pt-3 border-t border-border/50">
              <span className="text-[12px] text-muted-foreground mb-2 block">Etiquetas:</span>
              <div className="flex flex-wrap gap-1.5">
                {eventData.tags.map((tag: string) => (
                  <span key={tag} className="text-[11px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Section */}
      <div className="bg-card rounded-sm border border-[#c2c9d6] p-5 shadow-sm">
        <h4 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
          <Share2 className="size-4" />
          Compartir
        </h4>

        <div className="grid grid-cols-5 gap-2">
           <Button variant="outline" size="icon" className="w-full h-10" onClick={handleCopyLink} title="Copiar enlace">
             <LinkIcon className="size-4 text-muted-foreground" />
           </Button>
           <Button variant="outline" size="icon" className="w-full h-10" onClick={handleShareWhatsApp} title="WhatsApp">
             <span className="font-bold text-[#25D366]">W</span>
           </Button>
           <Button variant="outline" size="icon" className="w-full h-10" onClick={handleShareTelegram} title="Telegram">
             <span className="font-bold text-[#0088cc]">T</span>
           </Button>
           <Button variant="outline" size="icon" className="w-full h-10" onClick={handleShareFacebook} title="Facebook">
             <span className="font-bold text-[#1877F2]">f</span>
           </Button>
           <Button variant="outline" size="icon" className="w-full h-10" onClick={handleShareX} title="X">
             <span className="font-bold text-foreground">X</span>
           </Button>
        </div>
      </div>

    </aside>
  );
}
