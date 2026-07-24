import React, { useState } from "react";
import {
  MapPin,
  Clock,
  Users,
  Heart,
  Check,
  Bookmark,
  MoreHorizontal,
  Share,
  Link as LinkIcon,
  ExternalLink,
  Edit,
  Trash,
  Flag,
} from "lucide-react";
import { EventData } from "./types";
import { useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EventCardProps {
  event: any;
  variant?: "featured" | "important" | "compact" | "sidebar" | "horizontal";
}

export function EventCard({ event, variant = "compact" }: EventCardProps) {
  const navigate = useNavigate();
  const [isInterested, setIsInterested] = useState(event.status === "interested");
  const [isAttending, setIsAttending] = useState(event.status === "attending");
  const [isSaved, setIsSaved] = useState(event.status === "saved");
  const [interestedCount, setInterestedCount] = useState(event.max_attendees || 0);

  // Safe default for attendees
  const attendeesList = Array.isArray(event.attendees) ? event.attendees : [];
  const [attendeesCount, setAttendeesCount] = useState(attendeesList.length);

  // Safe split for date
  const dateStr = event.event_date || "";
  const dateParts = (dateStr ?? "").split(" ");
  const day = dateParts[0] || "";
  const month = dateParts[1] || "";

  // Safe defaults
  const eventName = event.name || "Evento sin título";
  const eventCity = event.city || "Sin ubicación";
  const eventLocation = event.location || eventCity; // fallback to city if location is undefined
  const eventDateDisplay = event.event_date || "Fecha pendiente";
  const eventTimeDisplay = event.event_time || "Hora pendiente";
  const eventDescription = event.description || "";
  const eventCategory = event.category || "Categoría";
  const coverUrl =
    event.cover ||
    event.cover_url || event.cover ||
    "https://images.unsplash.com/photo-1540039155732-d68832aeb482?ixlib=rb-4.0.3";
  const tagsList = Array.isArray(event.tags) ? event.tags : [];
  const organizerName = event.organizer || event.organizer_name || "";

  const handleInterest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInterested) {
      setIsInterested(false);
      setInterestedCount((prev: any) => prev - 1);
    } else {
      setIsInterested(true);
      setIsAttending(false);
      setInterestedCount((prev: any) => prev + 1);
      setIsSaved(true);
    }
  };

  const handleAttend = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAttending) {
      setIsAttending(false);
      setAttendeesCount((prev: any) => prev - 1);
    } else {
      setIsAttending(true);
      setIsInterested(false);
      setAttendeesCount((prev: any) => prev + 1);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const handleCardClick = () => {
    // If it has a slug or id, use it for navigation
    if (event.slug) {
      navigate({ to: `/eventos/${event.slug}` } as any);
    } else if (event.id) {
      navigate({ to: `/eventos/${event.id}` } as any);
    } else {
      navigate({ to: "/eventos" });
    }
  };

  // Common tags component
  const Tags = () => {
    if (tagsList.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {tagsList.map((tag: any) => (
          <span
            key={tag}
            className="bg-secondary/50 text-secondary-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  // Mobile More Options
  const MobileMoreOptions = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="sm:hidden p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Opciones"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem>
          <Share className="size-4 mr-2" /> Compartir
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Edit className="size-4 mr-2" /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          <Trash className="size-4 mr-2" /> Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Desktop More Options
  const DesktopMoreOptions = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
          aria-label="Opciones"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem>
          <Edit className="size-4 mr-2" /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <Trash className="size-4 mr-2" /> Eliminar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Flag className="size-4 mr-2" /> Reportar
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LinkIcon className="size-4 mr-2" /> Copiar enlace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // SIDEBAR VARIANT
  if (variant === "sidebar") {
    return (
      <div onClick={handleCardClick} className="flex gap-3 group cursor-pointer w-full">
        <img
          src={coverUrl}
          alt={eventName}
          className="w-[60px] h-[60px] rounded object-cover border border-border shrink-0"
        />
        <div className="flex flex-col justify-center min-w-0">
          <h5 className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {eventName}
          </h5>
          <span className="text-[12px] text-muted-foreground truncate">{eventLocation}</span>
          <span className="text-[11px] font-medium text-primary mt-0.5">{eventDateDisplay}</span>
        </div>
      </div>
    );
  }

  // FEATURED VARIANT

  if (variant === "horizontal") {
    return (
      <div
        onClick={handleCardClick}
        className="group flex flex-col sm:flex-row h-auto sm:h-[180px] bg-card rounded-[16px] border border-[#c2c9d6] overflow-hidden hover:shadow-md transition-all duration-150 cursor-pointer"
      >
        <div className="w-full sm:w-[280px] h-[160px] sm:h-full relative overflow-hidden shrink-0">
          <img
            src={
              event.cover_url || event.cover ||
              "https://images.unsplash.com/photo-1540039155732-d68832aeb482?ixlib=rb-4.0.3"
            }
            alt={event.name || event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 flex flex-col items-center bg-background/95 backdrop-blur px-2.5 py-1 rounded-[8px] shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              {dateParts.month}
            </span>
            <span className="text-[16px] font-extrabold text-foreground leading-tight">
              {dateParts.day}
            </span>
          </div>
          {event.category && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur rounded-[6px] text-white text-[11px] font-bold">
              {event.category}
            </div>
          )}
        </div>

        <div className="flex-1 p-5 flex flex-col min-w-0">
          <div className="flex justify-between items-start gap-4 mb-2">
            <h3 className="text-[18px] font-extrabold text-foreground truncate group-hover:text-primary transition-colors">
              {event.name || event.title}
            </h3>

            <div
              className="flex items-center gap-1.5 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleSave}
                      className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                        isSaved
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                      }`}
                    >
                      <Bookmark
                        className="size-[14px]"
                        fill={isSaved ? "currentColor" : "none"}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isSaved ? "Quitar de guardados" : "Guardar evento"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 rounded-full flex items-center justify-center bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors">
                    <MoreHorizontal className="size-[14px]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onClick={() => {}}>
                    <Share className="size-4 mr-2" /> Compartir
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <Flag className="size-4 mr-2" /> Reportar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[13px] text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              <span className="truncate max-w-[120px]">{event.city || "Ciudad"}</span>
            </div>
            {event.location && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                <span className="truncate max-w-[150px]">{event.location}</span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span>{dateParts.time}</span>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/150?u=${event.id}${i}`}
                    alt="Attendee"
                    className="w-7 h-7 rounded-full border-2 border-background object-cover"
                  />
                ))}
              </div>
              <span className="text-[12px] font-medium text-muted-foreground">
                <strong className="text-foreground">{event.attendeesCount || 24}</strong> asisten
              </span>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleInterest}
                className={`px-4 py-2 rounded-[8px] text-[13px] font-bold transition-all ${
                  isInterested
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {isInterested ? "Te interesa" : "Me interesa"}
              </button>

              <button
                onClick={() => navigate({ to: `/eventos/${event.slug || event.id}` })}
                className="px-4 py-2 rounded-[8px] text-[13px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                Ver evento
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div
        onClick={handleCardClick}
        className="bg-card rounded-sm border border-[#c2c9d6] flex flex-col md:flex-row shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer w-full h-full group"
      >
        <div className="hidden md:flex flex-col items-center justify-start py-6 px-4 w-[90px] border-r border-[#c2c9d6] shrink-0 bg-muted/20">
          <span className="text-[32px] font-extrabold text-primary leading-none mb-1">{day}</span>
          <span className="text-[13px] font-bold text-muted-foreground uppercase">{month}</span>
        </div>

        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-muted/10">
          <div className="flex items-center gap-2">
            <span className="text-[20px] font-extrabold text-primary leading-none">{day}</span>
            <span className="text-[13px] font-bold text-muted-foreground uppercase">{month}</span>
          </div>
        </div>

        <div className="w-full md:w-3/5 h-[200px] md:h-auto shrink-0 relative border-r border-border/50">
          <img src={coverUrl} alt={eventName} className="w-full h-full object-cover" />
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-sm text-[12px] font-medium">
            {eventCategory}
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1 w-full md:w-2/5 justify-between min-w-0">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-foreground leading-tight line-clamp-2 pr-2">
                {eventName}
              </h3>
              <div className="hidden md:block shrink-0">
                <DesktopMoreOptions />
              </div>
            </div>

            <p className="text-[14px] text-muted-foreground line-clamp-2">{eventDescription}</p>

            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-2 text-[13px] text-foreground font-medium">
                <MapPin className="size-4 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {eventLocation}, {eventCity}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-foreground font-medium">
                <Clock className="size-4 text-muted-foreground shrink-0" />
                <span>{eventTimeDisplay}</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-foreground font-medium">
                <Users className="size-4 text-muted-foreground shrink-0" />
                <span>
                  {interestedCount} interesados · {attendeesCount} asistentes
                </span>
              </div>
            </div>
            <Tags />
          </div>

          <div className="flex items-center justify-end mt-6 pt-5 border-t border-border/50 gap-2">
            <button
              onClick={handleInterest}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 font-bold text-[13px] px-4 py-2 rounded-sm transition-colors ${
                isInterested
                  ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <Heart className={`size-4 ${isInterested ? "fill-current" : ""}`} />
              Me interesa
            </button>

            <button
              onClick={handleAttend}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 font-bold text-[13px] px-4 py-2 rounded-sm transition-colors ${
                isAttending
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              {isAttending ? <Check className="size-4" /> : <Users className="size-4" />}
              Asistiré
            </button>
            <MobileMoreOptions />
          </div>
        </div>
      </div>
    );
  }

  // IMPORTANT AND COMPACT VARIANTS
  const imageClasses =
    variant === "important" ? "h-[180px] sm:h-[220px]" : "h-[160px] sm:h-[180px]";
  const titleClasses = variant === "important" ? "text-[18px]" : "text-[16px]";

  return (
    <div
      onClick={handleCardClick}
      className="bg-card rounded-sm border border-[#c2c9d6] flex flex-col shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer w-full h-full group"
    >
      <div className={`w-full shrink-0 relative ${imageClasses}`}>
        <img src={coverUrl} alt={eventName} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 flex flex-col items-center justify-center bg-background text-foreground shadow-md rounded-sm w-[42px] h-[46px] border border-border">
          <span className="text-[18px] font-extrabold leading-none text-primary">{day}</span>
          <span className="text-[9px] font-bold uppercase">{month}</span>
        </div>
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-sm text-[11px] font-medium">
          {eventCategory}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3
            className={`${titleClasses} font-bold text-foreground leading-tight line-clamp-2 pr-2`}
          >
            {eventName}
          </h3>
          <div className="shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 -mt-1 -mr-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
                  aria-label="Opciones"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem>
                  <Share className="size-4 mr-2" /> Compartir
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Edit className="size-4 mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash className="size-4 mr-2" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-[13px] text-muted-foreground line-clamp-2 mb-3">{eventDescription}</p>

        <div className="flex flex-col gap-1.5 mt-auto mb-4">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {eventLocation}, {eventCity}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            <span>{eventTimeDisplay}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <span className="font-bold text-foreground shrink-0">
              {event.price === 0 || !event.price ? "Gratis" : `${event.price}€`}
            </span>
            {organizerName && (
              <span className="truncate opacity-80 border-l pl-2 border-border/50">
                Por {organizerName}
              </span>
            )}
          </div>
          <Tags />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            {attendeesList.length > 0 ? (
              <div className="flex -space-x-1.5">
                {attendeesList.slice(0, 3).map((attendee: any, i: number) => (
                  <TooltipProvider key={attendee.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <img
                          src={
                            attendee.avatar ||
                            attendee.avatar_url ||
                            "https://github.com/shadcn.png"
                          }
                          alt={attendee.name || "Usuario"}
                          className="w-6 h-6 rounded-full border border-card object-cover"
                          style={{ zIndex: 3 - i }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{attendee.name || "Usuario"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-muted-foreground">Sé el primero</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleInterest}
              className={`p-1.5 rounded-sm transition-colors ${
                isInterested
                  ? "bg-red-500/10 text-red-500"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
              aria-label="Me interesa"
            >
              <Heart className={`size-4 ${isInterested ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleAttend}
              className={`flex items-center gap-1 font-bold text-[12px] px-3 py-1.5 rounded-sm transition-colors ${
                isAttending
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
              aria-label="Asistiré"
            >
              {isAttending ? <Check className="size-3.5" /> : <Users className="size-3.5" />}
              <span>{isAttending ? "Vas" : "Asistir"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
