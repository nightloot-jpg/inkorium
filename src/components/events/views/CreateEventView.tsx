import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Upload,
  X,
  MapPin,
  Calendar as CalendarIcon,
  Music,
  Youtube,
  Image as ImageIcon,
  Plus,
} from "lucide-react";

// Categorías del evento
const CATEGORIES = [
  "Concierto",
  "Festival",
  "Fiesta",
  "Teatro",
  "Deportes",
  "Arte",
  "Cine",
  "Gastronomía",
  "Gaming",
  "Cultura",
  "Otro",
];

// Esquema de validación con Zod
const eventSchema = z.object({
  // 1. Información básica
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  category: z.string().min(1, "Debes seleccionar una categoría"),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),

  // 2. Fecha y ubicación
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  city: z.string().min(1, "La ciudad es obligatoria"),
  address: z.string().optional(),
  venue: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  showMap: z.boolean().default(false),

  // 3. Imagen principal
  coverImage: z
    .any()
    .refine(
      (file) => file !== undefined && file !== null && file !== "",
      "La portada principal es obligatoria",
    ),
  posterImage: z.any().optional(),

  // 4. Información adicional
  isPaid: z.boolean().default(false),
  price: z.string().optional(),
  ticketUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),

  // 5. Organizador
  organizerName: z.string().optional(),
  organizerEmail: z.string().email("Debe ser un email válido").optional().or(z.literal("")),
  organizerWebsite: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  organizerInstagram: z.string().optional(),
  organizerFacebook: z.string().optional(),
  organizerX: z.string().optional(),
  organizerTikTok: z.string().optional(),

  // 6. Participación
  maxAttendees: z.string().optional(),
  showAttendees: z.boolean().default(true),
  allowComments: z.boolean().default(true),
  allowShares: z.boolean().default(true),
  allowPhotos: z.boolean().default(true),

  // 7. Privacidad
  privacy: z.enum(["public", "registered", "invited"]).default("public"),

  // 8. Etiquetas
  tags: z.array(z.string()).default([]),

  // 9. Música
  youtubeSong: z.string().url("Debe ser un enlace de YouTube válido").optional().or(z.literal("")),
  youtubePlaylist: z
    .string()
    .url("Debe ser un enlace de YouTube válido")
    .optional()
    .or(z.literal("")),
});

export type EventFormValues = z.infer<typeof eventSchema>;

interface CreateEventViewProps {
  existingEvent?: any;
}

export function CreateEventView({ existingEvent }: CreateEventViewProps) {
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "coverImage" | "posterImage",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue(fieldName, file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (fieldName === "coverImage") {
          setCoverPreview(reader.result as string);
        } else {
          setPosterPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    fieldName: "coverImage" | "posterImage",
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setValue(fieldName, file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (fieldName === "coverImage") {
          setCoverPreview(reader.result as string);
        } else {
          setPosterPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      title: existingEvent?.name || "",
      category: existingEvent?.category || "",
      shortDescription: existingEvent?.short_description || "",
      fullDescription: existingEvent?.description || "",
      startDate: existingEvent?.event_date || "",
      startTime: existingEvent?.event_time || "",
      endDate: existingEvent?.end_date || "",
      endTime: existingEvent?.end_time || "",
      city: existingEvent?.city || "",
      address: existingEvent?.address || "",
      venue: existingEvent?.venue || "",
      postalCode: existingEvent?.postal_code || "",
      country: existingEvent?.country || "",
      showMap: existingEvent?.show_map ?? false,
      isPaid: existingEvent?.is_paid ?? false,
      price: existingEvent?.price || "",
      ticketUrl: existingEvent?.ticket_url || "",
      organizerName: existingEvent?.organizer_name || "",
      organizerEmail: existingEvent?.organizer_email || "",
      organizerWebsite: existingEvent?.organizer_website || "",
      organizerInstagram: existingEvent?.organizer_instagram || "",
      organizerFacebook: existingEvent?.organizer_facebook || "",
      organizerX: existingEvent?.organizer_x || "",
      organizerTikTok: existingEvent?.organizer_tiktok || "",
      maxAttendees: existingEvent?.max_attendees ? String(existingEvent.max_attendees) : "",
      showAttendees: existingEvent?.show_attendees ?? true,
      allowComments: existingEvent?.allow_comments ?? true,
      allowShares: existingEvent?.allow_shares ?? true,
      allowPhotos: existingEvent?.allow_photos ?? true,
      privacy: existingEvent?.privacy || "public",
      tags: existingEvent?.tags || [],
      youtubeSong: existingEvent?.youtube_song || "",
      youtubePlaylist: existingEvent?.youtube_playlist || "",
    },
  });

  const navigate = useNavigate();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: any, status: "published" | "draft" = "published") => {
    try {
      setIsSubmitting(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("Debes iniciar sesión para crear eventos");
        return;
      }

      const author_id = session.user.id;

      // Generar slug
      const slugBase = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      const uniqueSuffix = Math.random().toString(36).substring(2, 8);
      const slug = `${slugBase}-${uniqueSuffix}`;

      // Subir imágenes
      let cover_url = null;
      if (data.coverImage) {
        // En una implementación real, aquí leeríamos el File, generaríamos un nombre único y subiríamos a bucket "media".
        // Para simplificar, asumiremos que coverImage puede ser un blob/URL temporal que ya se estaba manejando o subiremos directamente si es File.
        // Si el usuario sube un archivo real, se debería subir aquí. Para este componente vamos a hacer un mock de subida real con storage de supabase
        if (data.coverImage instanceof FileList && data.coverImage.length > 0) {
          const file = data.coverImage[0];
          const fileExt = (file.name || "").split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `events/${slug}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("media")
            .upload(filePath, file);
          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(filePath);
            cover_url = publicUrlData.publicUrl;
          }
        }
      }

      let poster_url = null;
      if (data.posterImage) {
        if (data.posterImage instanceof FileList && data.posterImage.length > 0) {
          const file = data.posterImage[0];
          const fileExt = (file.name || "").split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `events/${slug}/poster_${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("media")
            .upload(filePath, file);
          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(filePath);
            poster_url = publicUrlData.publicUrl;
          }
        }
      }

      // Insertar en events
      const eventPayload: any = {
        name: data.title,
        category: data.category,
        short_description: data.shortDescription,
        description: data.fullDescription,
        event_date: data.startDate,
        event_time: data.startTime || "00:00:00",
        end_date: data.endDate || null,
        end_time: data.endTime || null,
        city: data.city,
        address: data.address,
        venue: data.venue,
        postal_code: data.postalCode,
        country: data.country,
        show_map: data.showMap,
        cover_url,
        poster_url,
        is_paid: data.isPaid,
        price: data.price,
        ticket_url: data.ticketUrl,
        organizer_name: data.organizerName,
        organizer_email: data.organizerEmail,
        organizer_website: data.organizerWebsite,
        organizer_instagram: data.organizerInstagram,
        organizer_facebook: data.organizerFacebook,
        organizer_x: data.organizerX,
        organizer_tiktok: data.organizerTikTok,
        max_attendees: data.maxAttendees ? parseInt(data.maxAttendees) : null,
        show_attendees: data.showAttendees,
        allow_comments: data.allowComments,
        allow_shares: data.allowShares,
        allow_photos: data.allowPhotos,
        privacy: data.privacy,
        tags: data.tags,
        youtube_song: data.youtubeSong,
        youtube_playlist: data.youtubePlaylist,
        status,
        slug,
      };

      let newEvent;
      let error;
      if (existingEvent) {
        const res = await supabase
          .from("events")
          .update(eventPayload)
          .eq("id", existingEvent.id)
          .select()
          .maybeSingle();
        newEvent = res.data;
        error = res.error;
      } else {
        const res = await supabase
          .from("events")
          .insert({ ...eventPayload, author_id } as any)
          .select()
          .maybeSingle();
        newEvent = res.data;
        error = res.error;
      }

      if (error) throw error;

      toast.success(
        status === "published" ? "Evento publicado correctamente" : "Borrador guardado",
      );

      if (status === "published") {
        navigate({
          to: "/eventos/$id",
          params: { id: (newEvent as any).slug || (newEvent as any).id },
        });
      } else {
        navigate({ to: "/eventos/mis-eventos" });
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al guardar el evento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Crear evento</h1>
        <p className="text-muted-foreground text-[15px]">
          Organiza tu propio evento e invita a la comunidad.
        </p>
      </div>

      <form onSubmit={handleSubmit((data) => onSubmit(data, "published"))} className="space-y-8">
        <Card className="bg-card rounded-sm border border-[#c2c9d6] shadow-sm">
          <CardHeader>
            <CardTitle>1. Información del evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del evento *</Label>
              <Input id="title" {...register("title")} placeholder="Ej. Festival de Verano 2024" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Descripción corta</Label>
              <Input
                id="shortDescription"
                {...register("shortDescription")}
                placeholder="Breve resumen del evento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullDescription">Descripción completa</Label>
              <Textarea
                id="fullDescription"
                {...register("fullDescription")}
                placeholder="Todos los detalles que los asistentes necesitan saber..."
                className="min-h-[150px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card rounded-sm border border-[#c2c9d6] shadow-sm">
          <CardHeader>
            <CardTitle>2. Fecha y ubicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha inicio *</Label>
                <Input type="date" id="startDate" {...register("startDate")} />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora inicio</Label>
                <Input type="time" id="startTime" {...register("startTime")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha final (opcional)</Label>
                <Input type="date" id="endDate" {...register("endDate")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora final (opcional)</Label>
                <Input type="time" id="endTime" {...register("endTime")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad *</Label>
                <Input id="city" {...register("city")} placeholder="Ej. Madrid" />
                {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue">Lugar (opcional)</Label>
                <Input id="venue" {...register("venue")} placeholder="Ej. WiZink Center" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Dirección (opcional)</Label>
                <Input id="address" {...register("address")} placeholder="Ej. Av. Felipe II, s/n" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Código postal (opcional)</Label>
                <Input id="postalCode" {...register("postalCode")} placeholder="Ej. 28009" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País (opcional)</Label>
              <Input id="country" {...register("country")} placeholder="Ej. España" />
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                control={control}
                name="showMap"
                render={({ field }) => (
                  <Checkbox id="showMap" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor="showMap" className="font-normal cursor-pointer">
                Mostrar mapa en la página del evento
              </Label>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card rounded-sm border border-[#c2c9d6] shadow-sm">
          <CardHeader>
            <CardTitle>3. Imagen principal</CardTitle>
            <CardDescription>Sube la portada principal y el cartel del evento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Portada principal *</Label>
              <div
                className="border-2 border-dashed border-[#c2c9d6] rounded-md flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, "coverImage")}
                onClick={() => document.getElementById("cover-upload")?.click()}
                style={{ height: "200px" }}
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center p-8">
                    <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-sm font-medium mb-1">Haz clic o arrastra la imagen aquí</p>
                    <p className="text-xs text-muted-foreground">
                      Recomendado: 1200x630px. Max 5MB.
                    </p>
                  </div>
                )}
                <input
                  id="cover-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "coverImage")}
                />
              </div>
              {errors.coverImage && (
                <p className="text-sm text-destructive">{errors.coverImage.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Cartel del evento (opcional)</Label>
              <div
                className="border-2 border-dashed border-[#c2c9d6] rounded-md flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, "posterImage")}
                onClick={() => document.getElementById("poster-upload")?.click()}
                style={{ height: "300px", width: "200px", margin: "0 auto" }}
              >
                {posterPreview ? (
                  <img
                    src={posterPreview}
                    alt="Poster preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center p-4">
                    <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-sm font-medium mb-1">Añadir cartel oficial</p>
                    <p className="text-xs text-muted-foreground">Formato vertical. Max 5MB.</p>
                  </div>
                )}
                <input
                  id="poster-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "posterImage")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card rounded-sm border border-[#c2c9d6] shadow-sm">
          <CardHeader>
            <CardTitle>4. Información adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Precio</Label>
              <Controller
                control={control}
                name="isPaid"
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={(val) => field.onChange(val === "true")}
                    defaultValue={field.value ? "true" : "false"}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="free" />
                      <Label htmlFor="free" className="font-normal cursor-pointer">
                        Gratis
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="paid" />
                      <Label htmlFor="paid" className="font-normal cursor-pointer">
                        De pago
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>

            {watch("isPaid") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio desde</Label>
                  <Input id="price" {...register("price")} placeholder="Ej. 15€" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticketUrl">Enlace de compra de entradas</Label>
                  <Input id="ticketUrl" {...register("ticketUrl")} placeholder="https://" />
                  {errors.ticketUrl && (
                    <p className="text-sm text-destructive">{errors.ticketUrl.message}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card rounded-sm border border-[#c2c9d6] shadow-sm">
          <CardHeader>
            <CardTitle>5. Organizador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizerName">Nombre del organizador</Label>
                <Input
                  id="organizerName"
                  {...register("organizerName")}
                  placeholder="Ej. Live Nation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizerEmail">Correo electrónico</Label>
                <Input
                  id="organizerEmail"
                  type="email"
                  {...register("organizerEmail")}
                  placeholder="contacto@ejemplo.com"
                />
                {errors.organizerEmail && (
                  <p className="text-sm text-destructive">{errors.organizerEmail.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizerWebsite">Sitio web</Label>
                <Input
                  id="organizerWebsite"
                  {...register("organizerWebsite")}
                  placeholder="https://"
                />
                {errors.organizerWebsite && (
                  <p className="text-sm text-destructive">{errors.organizerWebsite.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizerInstagram">Instagram (opcional)</Label>
                <Input
                  id="organizerInstagram"
                  {...register("organizerInstagram")}
                  placeholder="@usuario"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizerFacebook">Facebook (opcional)</Label>
                <Input id="organizerFacebook" {...register("organizerFacebook")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizerX">X / Twitter (opcional)</Label>
                <Input id="organizerX" {...register("organizerX")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizerTikTok">TikTok (opcional)</Label>
                <Input id="organizerTikTok" {...register("organizerTikTok")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card rounded-sm border border-[#c2c9d6] shadow-sm">
          <CardHeader>
            <CardTitle>6. Participación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="maxAttendees">Número máximo de asistentes (opcional)</Label>
              <Input
                id="maxAttendees"
                type="number"
                {...register("maxAttendees")}
                placeholder="Dejar en blanco si no hay límite"
                className="max-w-xs"
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <Controller
                  control={control}
                  name="showAttendees"
                  render={({ field }) => (
                    <Switch
                      id="showAttendees"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="showAttendees" className="font-normal cursor-pointer">
                  Mostrar asistentes públicamente
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  control={control}
                  name="allowComments"
                  render={({ field }) => (
                    <Switch
                      id="allowComments"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="allowComments" className="font-normal cursor-pointer">
                  Permitir comentarios
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  control={control}
                  name="allowShares"
                  render={({ field }) => (
                    <Switch
                      id="allowShares"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="allowShares" className="font-normal cursor-pointer">
                  Permitir compartir
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  control={control}
                  name="allowPhotos"
                  render={({ field }) => (
                    <Switch
                      id="allowPhotos"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="allowPhotos" className="font-normal cursor-pointer">
                  Permitir fotos del evento
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card rounded-sm border border-[#c2c9d6] shadow-sm">
          <CardHeader>
            <CardTitle>7. Privacidad</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="privacy"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Selecciona la privacidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público (cualquiera puede verlo)</SelectItem>
                    <SelectItem value="registered">Solo usuarios registrados</SelectItem>
                    <SelectItem value="invited">Solo invitados (evento privado)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </CardContent>
        </Card>

        <Card className="bg-card rounded-sm border border-[#c2c9d6] shadow-sm">
          <CardHeader>
            <CardTitle>8. Etiquetas</CardTitle>
            <CardDescription>
              Añade palabras clave (ej: Rock, Madrid, Festival, Verano)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2 max-w-md">
              <Input
                id="tagInput"
                placeholder="Añadir etiqueta..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const input = e.currentTarget;
                    const value = input.value.trim();
                    if (value) {
                      const currentTags = watch("tags") || [];
                      if (!currentTags.includes(value)) {
                        setValue("tags", [...currentTags, value]);
                      }
                      input.value = "";
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const input = document.getElementById("tagInput") as HTMLInputElement;
                  const value = input.value.trim();
                  if (value) {
                    const currentTags = watch("tags") || [];
                    if (!currentTags.includes(value)) {
                      setValue("tags", [...currentTags, value]);
                    }
                    input.value = "";
                  }
                }}
              >
                Añadir
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {watch("tags")?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1 bg-muted">
                  {tag}
                  <button
                    type="button"
                    className="ml-2 hover:text-destructive focus:outline-none"
                    onClick={() => {
                      const currentTags = watch("tags");
                      setValue(
                        "tags",
                        currentTags.filter((_, i) => i !== index),
                      );
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {(watch("tags")?.length === 0 || !watch("tags")) && (
                <p className="text-sm text-muted-foreground italic">No hay etiquetas añadidas.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card rounded-sm border border-[#c2c9d6] shadow-sm bg-gradient-to-br from-card to-muted/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              <CardTitle>🎵 Música del evento</CardTitle>
            </div>
            <CardDescription>
              Añade música para definir el ambiente de tu evento (muy estilo Tuenti/MySpace)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtubeSong">Canción oficial (Enlace de YouTube)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Youtube className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="youtubeSong"
                    className="pl-9"
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...register("youtubeSong")}
                  />
                </div>
              </div>
              {errors.youtubeSong && (
                <p className="text-sm text-destructive">{errors.youtubeSong.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubePlaylist">Playlist del evento (YouTube)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Youtube className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="youtubePlaylist"
                    className="pl-9"
                    placeholder="https://www.youtube.com/playlist?list=..."
                    {...register("youtubePlaylist")}
                  />
                </div>
              </div>
              {errors.youtubePlaylist && (
                <p className="text-sm text-destructive">{errors.youtubePlaylist.message}</p>
              )}
            </div>

            {(watch("youtubeSong") || watch("youtubePlaylist")) && (
              <div className="pt-4 border-t border-border/50 mt-4">
                <p className="text-sm font-medium mb-3">Vista previa del reproductor:</p>
                <div className="bg-black/5 aspect-video w-full max-w-md rounded-md flex items-center justify-center border border-border">
                  <p className="text-sm text-muted-foreground">
                    Reproductor de música aparecerá aquí en el evento
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 pb-12">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              if (window.confirm("¿Deseas salir sin guardar? Los cambios se perderán.")) {
                navigate({ to: "/eventos" });
              }
            }}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto bg-muted"
            onClick={handleSubmit((data) => onSubmit(data, "draft"))}
            disabled={isSubmitting}
          >
            Guardar borrador
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto font-medium shadow-sm"
            disabled={isSubmitting}
          >
            Publicar evento
          </Button>
        </div>
      </form>
    </div>
  );
}
