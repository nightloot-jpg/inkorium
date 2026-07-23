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
}

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
    date: "20 Oct",
    time: "10:00",
    attendees: [
      { id: "a4", name: "David", avatar: "https://i.pravatar.cc/150?u=a4" },
      { id: "a5", name: "Sofía", avatar: "https://i.pravatar.cc/150?u=a5" },
    ],
    interested: 342,
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
