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
import { Link, useNavigate } from "@tanstack/react-router";
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
}

export function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();
  const [isInterested, setIsInterested] = useState(event.status === "interested");
  const [isAttending, setIsAttending] = useState(event.status === "attending");
  const [isSaved, setIsSaved] = useState(event.status === "saved");
  const [interestedCount, setInterestedCount] = useState(event.interested);
  const [attendeesCount, setAttendeesCount] = useState(event.attendees.length); // Assuming event.attendees.length + event.friendsAttending or just using length for demo

  const dateParts = event.date.split(" ");
  const day = dateParts[0];
  const month = dateParts[1];

  const handleInterest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInterested) {
      setIsInterested(false);
      setInterestedCount((prev) => prev - 1);
      // In a real app, this would also un-save or change status in backend
    } else {
      setIsInterested(true);
      setIsAttending(false);
      setInterestedCount((prev) => prev + 1);
      setIsSaved(true); // "guarda el evento en 'Mis eventos'"
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
    navigate({ to: "/eventos" }); // Temporary fallback since /eventos/$eventId does not exist in routes yet
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-card rounded-sm border border-[#c2c9d6] flex flex-col sm:flex-row shadow-sm hover:border-primary/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden cursor-pointer w-full group relative"
    >
      {/* Date sidebar for desktop */}
      <div className="hidden sm:flex flex-col items-center justify-start py-6 px-4 w-[80px] border-r border-[#c2c9d6] shrink-0 bg-muted/20">
        <span className="text-[28px] font-extrabold text-primary leading-none mb-1">{day}</span>
        <span className="text-[12px] font-bold text-muted-foreground uppercase">{month}</span>
      </div>

      {/* Date header for mobile */}
      <div className="sm:hidden flex items-center justify-between p-4 border-b border-border bg-muted/10">
        <div className="flex items-center gap-2">
          <span className="text-[20px] font-extrabold text-primary leading-none">{day}</span>
          <span className="text-[13px] font-bold text-muted-foreground uppercase">{month}</span>
        </div>

        {/* Mobile quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className={`p-1.5 rounded-full transition-colors ${isSaved ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
            aria-label="Guardar"
          >
            <Bookmark className={`size-4 ${isSaved ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-1">
        {/* Cover image */}
        <div className="w-full sm:w-[220px] h-[180px] sm:h-auto shrink-0 relative">
          <img src={event.cover} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2 sm:hidden bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-sm text-[11px] font-medium">
            {event.category}
          </div>
          {/* Tags overlay */}
          {event.tags && event.tags.length > 0 && (
            <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="p-5 flex flex-col flex-1 justify-between min-w-0">
          <div>
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-[18px] font-bold text-foreground leading-tight line-clamp-2">
                  {event.title}
                </h3>
                <p className="text-[13px] text-muted-foreground mt-1 line-clamp-2">
                  {event.description}
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-sm">
                  {event.category}
                </span>
                {/* Desktop more options menu */}
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
                  <DropdownMenuContent
                    align="end"
                    className="w-48"
                    onClick={(e) => e.stopPropagation()}
                  >
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
              </div>
            </div>

            {/* Info rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" />
                  <span className="truncate">
                    {event.location}, {event.city}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Clock className="size-3.5 shrink-0" />
                  <span>{event.time}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <span className="font-medium text-foreground shrink-0 text-[13px]">
                    {event.price === 0 ? "Gratis" : `${event.price}€`}
                  </span>
                  {event.organizer && (
                    <span className="truncate text-[12px] opacity-80 border-l pl-2 border-border/50">
                      Por {event.organizer}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Users className="size-3.5 shrink-0" />
                  <span>
                    {interestedCount} interesados · {attendeesCount} asistentes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
            {/* Avatars */}
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
                            className="w-7 h-7 rounded-full border-2 border-card object-cover"
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
                  {attendeesCount > 3 && (
                    <div className="w-7 h-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground z-0">
                      +{attendeesCount - 3}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-[12px] text-muted-foreground">Sé el primero en asistir</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleInterest}
                className={`flex items-center gap-1.5 font-bold text-[12px] px-2.5 py-1.5 rounded-sm transition-colors ${
                  isInterested
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    : "bg-transparent text-muted-foreground hover:bg-muted"
                }`}
                aria-label="Me interesa"
              >
                <Heart className={`size-3.5 ${isInterested ? "fill-current" : ""}`} />
                <span className="hidden sm:inline">Me interesa</span>
              </button>

              <button
                onClick={handleAttend}
                className={`flex items-center gap-1.5 font-bold text-[12px] px-2.5 py-1.5 rounded-sm transition-colors ${
                  isAttending
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                aria-label="Asistiré"
              >
                {isAttending ? <Check className="size-3.5" /> : <Users className="size-3.5" />}
                <span className="hidden sm:inline">Asistiré</span>
                <span className="sm:hidden">{isAttending ? "Vas" : "Asistir"}</span>
              </button>

              <div className="hidden sm:flex items-center gap-1 ml-1 border-l pl-2 border-border">
                <button
                  onClick={handleSave}
                  className={`p-1.5 rounded-sm transition-colors ${isSaved ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
                  aria-label="Guardar"
                >
                  <Bookmark className={`size-4 ${isSaved ? "fill-current" : ""}`} />
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Compartir"
                    >
                      <Share className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem>
                      <Share className="size-4 mr-2" /> Compartir en Inkorium
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LinkIcon className="size-4 mr-2" /> Copiar enlace
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ExternalLink className="size-4 mr-2" /> Abrir evento
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile more options */}
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
        </div>
      </div>
    </div>
  );
}
