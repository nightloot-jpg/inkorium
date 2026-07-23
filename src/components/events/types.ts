export interface Attendee {
  id: string;
  name: string;
  avatar: string;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  cover: string;
  category: string;
  location: string;
  city: string;
  date: string;
  time: string;
  attendees: Attendee[];
  interested: number;
  artist?: string;
  organizer?: string;
  price: number;
  isOnline: boolean;
  dateISO: string;
  friendsAttending: number;
  createdAt: string;
  tags?: string[];
  status?: "saved" | "attending" | "interested" | null;
}

// Current date in memory is 2026-07-23.
// We will create events for today, this week, this month to test filters.
// 2026-07-23 is a Thursday.
export const MOCK_EVENTS: EventData[] = [
  {
    id: "1",
    title: "Arctic Monkeys - World Tour 2026",
    description: "Concierto en vivo de Arctic Monkeys presentando su nuevo álbum.",
    cover:
      "https://images.unsplash.com/photo-1540039155732-d68832aeb482?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    category: "Conciertos",
    location: "Estadio Olímpico",
    city: "Madrid",
    date: "15 Oct",
    time: "21:00",
    attendees: [
      { id: "a1", name: "Ana", avatar: "https://i.pravatar.cc/150?u=a1" },
      { id: "a2", name: "Carlos", avatar: "https://i.pravatar.cc/150?u=a2" },
      { id: "a3", name: "Elena", avatar: "https://i.pravatar.cc/150?u=a3" },
    ],
    interested: 1245,
    artist: "Arctic Monkeys",
    organizer: "Live Nation",
    price: 50,
    isOnline: false,
    dateISO: "2026-10-15T21:00:00Z",
    friendsAttending: 2,
    createdAt: "2026-07-01T10:00:00Z",
    tags: ["De pago"],
    status: "interested",
  },
  {
    id: "2",
    title: "Festival de Arte Digital",
    description: "Exhibición de las mejores obras de arte digital del año.",
    cover:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    category: "Arte",
    location: "Matadero",
    city: "Madrid",
    date: "23 Jul", // Today
    time: "10:00",
    attendees: [
      { id: "a4", name: "David", avatar: "https://i.pravatar.cc/150?u=a4" },
      { id: "a5", name: "Sofía", avatar: "https://i.pravatar.cc/150?u=a5" },
    ],
    interested: 342,
    artist: "Varios",
    organizer: "Ayuntamiento de Madrid",
    price: 0,
    isOnline: false,
    dateISO: "2026-07-23T10:00:00Z",
    friendsAttending: 0,
    createdAt: "2026-07-15T10:00:00Z",
    tags: ["Gratis", "Hoy", "Nuevo"],
    status: "attending",
  },
  {
    id: "3",
    title: "Torneo de eSports 2026",
    description: "La final mundial de League of Legends.",
    cover:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    category: "Gaming",
    location: "Twitch",
    city: "Online",
    date: "25 Jul", // This week (Saturday)
    time: "17:00",
    attendees: [{ id: "a6", name: "Javier", avatar: "https://i.pravatar.cc/150?u=a6" }],
    interested: 890,
    artist: "Riot Games",
    organizer: "LVP",
    price: 0,
    isOnline: true,
    dateISO: "2026-07-25T17:00:00Z",
    friendsAttending: 1,
    createdAt: "2026-07-20T10:00:00Z",
    tags: ["Online", "Gratis", "Este fin de semana"],
    status: null,
  },
  {
    id: "4",
    title: "Feria Gastronómica Internacional",
    description: "Prueba los mejores platillos del mundo en un solo lugar.",
    cover:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    category: "Gastronomía",
    location: "IFEMA",
    city: "Madrid",
    date: "28 Jul", // This month
    time: "12:00",
    attendees: [
      { id: "a7", name: "Lucía", avatar: "https://i.pravatar.cc/150?u=a7" },
      { id: "a8", name: "Marcos", avatar: "https://i.pravatar.cc/150?u=a8" },
      { id: "a9", name: "María", avatar: "https://i.pravatar.cc/150?u=a9" },
      { id: "a10", name: "Pedro", avatar: "https://i.pravatar.cc/150?u=a10" },
    ],
    interested: 2100,
    artist: "Varios Chefs",
    organizer: "IFEMA",
    price: 15,
    isOnline: false,
    dateISO: "2026-07-28T12:00:00Z",
    friendsAttending: 3,
    createdAt: "2026-07-22T10:00:00Z",
    tags: ["De pago", "Patrocinado"],
    status: "saved",
  },
];

export const MOCK_CATEGORIES = [
  "Todos",
  "Conciertos",
  "Festivales",
  "Fiestas",
  "Teatro",
  "Deportes",
  "Arte",
  "Cine",
  "Gastronomía",
  "Gaming",
  "Cultura",
];
