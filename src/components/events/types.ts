export interface Attendee {
  id: string;
  name: string;
  avatar: string;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  cover_url?: string;
  poster_url?: string;
  category: string;
  location: string;
  city: string;
  address?: string;
  venue?: string;
  postal_code?: string;
  country?: string;
  show_map?: boolean;
  start_date: string;
  start_time: string;
  end_date?: string;
  end_time?: string;
  is_paid?: boolean;
  price?: string;
  ticket_url?: string;
  organizer_name?: string;
  organizer_email?: string;
  organizer_website?: string;
  organizer_instagram?: string;
  organizer_facebook?: string;
  organizer_x?: string;
  organizer_tiktok?: string;
  max_attendees?: number;
  show_attendees?: boolean;
  allow_comments?: boolean;
  allow_shares?: boolean;
  allow_photos?: boolean;
  privacy?: string;
  tags?: string[];
  youtube_song?: string;
  youtube_playlist?: string;
  status?: string;
  author_id: string;
  created_at: string;
  // UI related specific fields
  attendees?: Attendee[];
  interested?: number;
  isOnline?: boolean;
  friendsAttending?: number;
}

export const MOCK_CATEGORIES = [
  "Todos",
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
];
