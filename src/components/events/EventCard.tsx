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
  event: EventData;
  variant?: "featured" | "important" | "compact" | "sidebar";
}

export function EventCard({ event, variant = "compact" }: EventCardProps) {
  const navigate = useNavigate();
  const [isInterested, setIsInterested] = useState(event.status === "interested");
  const [isAttending, setIsAttending] = useState(event.status === "attending");
  const [isSaved, setIsSaved] = useState(event.status === "saved");
  const [interestedCount, setInterestedCount] = useState(event.interested);
  const [attendeesCount, setAttendeesCount] = useState(event.attendees.length);

  const dateParts = event.date.split(" ");
  const day = dateParts[0];
  const month = dateParts[1];

  const handleInterest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInterested) {
      setIsInterested(false);
      setInterestedCount((prev) => prev - 1);
    } else {
      setIsInterested(true);
      setIsAttending(false);
      setInterestedCount((prev) => prev + 1);
      setIsSaved(true);
    }
  };

  const handleAttend = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAttending) {
      setIsAttending(false);
      setAttendeesCount((prev) => prev - 1);
    } else {
      setIsAttending(true);
      setIsInterested(false);
      setAttendeesCount((prev) => prev + 1);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const handleCardClick = () => {
    navigate({ to: "/eventos" }); // Temporary fallback
  };

  // Common tags component
  const Tags = () => {
    if (!event.tags || event.tags.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {event.tags.map((tag) => (
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
          src={event.cover}
          alt={event.title}
          className="w-[60px] h-[60px] rounded object-cover border border-border shrink-0"
        />
        <div className="flex flex-col justify-center min-w-0">
          <h5 className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {event.title}
          </h5>
          <span className="text-[12px] text-muted-foreground truncate">{event.location}</span>
          <span className="text-[11px] font-medium text-primary mt-0.5">{event.date}</span>
        </div>
      </div>
    );
  }

  // FEATURED VARIANT
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
          <img src={event.cover} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-sm text-[12px] font-medium">
            {event.category}
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1 w-full md:w-2/5 justify-between min-w-0">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-foreground leading-tight line-clamp-2 pr-2">
                {event.title}
              </h3>
              <div className="hidden md:block shrink-0">
                <DesktopMoreOptions />
              </div>
            </div>

            <p className="text-[14px] text-muted-foreground line-clamp-2">{event.description}</p>

            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-2 text-[13px] text-foreground font-medium">
                <MapPin className="size-4 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {event.location}, {event.city}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-foreground font-medium">
                <Clock className="size-4 text-muted-foreground shrink-0" />
                <span>{event.time}</span>
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
        <img src={event.cover} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 flex flex-col items-center justify-center bg-background text-foreground shadow-md rounded-sm w-[42px] h-[46px] border border-border">
          <span className="text-[18px] font-extrabold leading-none text-primary">{day}</span>
          <span className="text-[9px] font-bold uppercase">{month}</span>
        </div>
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-sm text-[11px] font-medium">
          {event.category}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3
            className={`${titleClasses} font-bold text-foreground leading-tight line-clamp-2 pr-2`}
          >
            {event.title}
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

        <p className="text-[13px] text-muted-foreground line-clamp-2 mb-3">{event.description}</p>

        <div className="flex flex-col gap-1.5 mt-auto mb-4">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {event.location}, {event.city}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <span className="font-bold text-foreground shrink-0">
              {event.price === 0 ? "Gratis" : `${event.price}€`}
            </span>
            {event.organizer && (
              <span className="truncate opacity-80 border-l pl-2 border-border/50">
                Por {event.organizer}
              </span>
            )}
          </div>
          <Tags />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            {event.attendees.length > 0 ? (
              <div className="flex -space-x-1.5">
                {event.attendees.slice(0, 3).map((attendee, i) => (
                  <TooltipProvider key={attendee.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <img
                          src={attendee.avatar}
                          alt={attendee.name}
                          className="w-6 h-6 rounded-full border border-card object-cover"
                          style={{ zIndex: 3 - i }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{attendee.name}</p>
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
