export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      saved_events: {
        Row: {
          event_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          event_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          event_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_events_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      event_attendees: {
        Row: {
          created_at: string;
          event_id: string;
          status: Database["public"]["Enums"]["event_attendee_status"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          event_id: string;
          status?: Database["public"]["Enums"]["event_attendee_status"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          event_id?: string;
          status?: Database["public"]["Enums"]["event_attendee_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          author_id: string;
          name: string;
          event_date: string;
          event_time: string;
          slug: string | null;
          category: string | null;
          short_description: string | null;
          end_date: string | null;
          end_time: string | null;
          city: string | null;
          address: string | null;
          venue: string | null;
          postal_code: string | null;
          country: string | null;
          show_map: boolean | null;
          cover_url: string | null;
          poster_url: string | null;
          is_paid: boolean | null;
          price: string | null;
          ticket_url: string | null;
          organizer_name: string | null;
          organizer_email: string | null;
          organizer_website: string | null;
          organizer_instagram: string | null;
          organizer_facebook: string | null;
          organizer_x: string | null;
          organizer_tiktok: string | null;
          max_attendees: number | null;
          show_attendees: boolean | null;
          allow_comments: boolean | null;
          allow_shares: boolean | null;
          allow_photos: boolean | null;
          privacy: string | null;
          tags: string[] | null;
          youtube_song: string | null;
          youtube_playlist: string | null;
          status: string | null;
          description: string | null;
          created_at: string;
          id: string;
        };
        Insert: {
          author_id: string;
          name: string;
          event_date: string;
          event_time: string;
          slug?: string | null;
          category?: string | null;
          short_description?: string | null;
          end_date?: string | null;
          end_time?: string | null;
          city?: string | null;
          address?: string | null;
          venue?: string | null;
          postal_code?: string | null;
          country?: string | null;
          show_map?: boolean | null;
          cover_url?: string | null;
          poster_url?: string | null;
          is_paid?: boolean | null;
          price?: string | null;
          ticket_url?: string | null;
          organizer_name?: string | null;
          organizer_email?: string | null;
          organizer_website?: string | null;
          organizer_instagram?: string | null;
          organizer_facebook?: string | null;
          organizer_x?: string | null;
          organizer_tiktok?: string | null;
          max_attendees?: number | null;
          show_attendees?: boolean | null;
          allow_comments?: boolean | null;
          allow_shares?: boolean | null;
          allow_photos?: boolean | null;
          privacy?: string | null;
          tags?: string[] | null;
          youtube_song?: string | null;
          youtube_playlist?: string | null;
          status?: string | null;
          description?: string | null;
          created_at?: string;
          id?: string;
        };
        Update: {
          author_id?: string;
          name?: string;
          event_date?: string;
          event_time?: string;
          slug?: string | null;
          category?: string | null;
          short_description?: string | null;
          end_date?: string | null;
          end_time?: string | null;
          city?: string | null;
          address?: string | null;
          venue?: string | null;
          postal_code?: string | null;
          country?: string | null;
          show_map?: boolean | null;
          cover_url?: string | null;
          poster_url?: string | null;
          is_paid?: boolean | null;
          price?: string | null;
          ticket_url?: string | null;
          organizer_name?: string | null;
          organizer_email?: string | null;
          organizer_website?: string | null;
          organizer_instagram?: string | null;
          organizer_facebook?: string | null;
          organizer_x?: string | null;
          organizer_tiktok?: string | null;
          max_attendees?: number | null;
          show_attendees?: boolean | null;
          allow_comments?: boolean | null;
          allow_shares?: boolean | null;
          allow_photos?: boolean | null;
          privacy?: string | null;
          tags?: string[] | null;
          youtube_song?: string | null;
          youtube_playlist?: string | null;
          status?: string | null;
          description?: string | null;
          created_at?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      comments: {
        Row: {
          author_id: string;
          content: string;
          created_at: string;
          id: string;
          post_id: string;
        };
        Insert: {
          author_id: string;
          content: string;
          created_at?: string;
          id?: string;
          post_id: string;
        };
        Update: {
          author_id?: string;
          content?: string;
          created_at?: string;
          id?: string;
          post_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      friendships: {
        Row: {
          addressee_id: string;
          created_at: string;
          id: string;
          requester_id: string;
          status: Database["public"]["Enums"]["friendship_status"];
          updated_at: string;
        };
        Insert: {
          addressee_id: string;
          created_at?: string;
          id?: string;
          requester_id: string;
          status?: Database["public"]["Enums"]["friendship_status"];
          updated_at?: string;
        };
        Update: {
          addressee_id?: string;
          created_at?: string;
          id?: string;
          requester_id?: string;
          status?: Database["public"]["Enums"]["friendship_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_id_fkey";
            columns: ["addressee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friendships_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      likes: {
        Row: {
          created_at: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          read_at: string | null;
          recipient_id: string;
          sender_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          recipient_id: string;
          sender_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          recipient_id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      profile_visits: {
        Row: {
          id: string;
          profile_id: string;
          visitor_id: string;
          visited_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          visitor_id: string;
          visited_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          visitor_id?: string;
          visited_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_visits_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_visits_visitor_id_fkey";
            columns: ["visitor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          author_id: string;
          content: string;
          created_at: string;
          id: string;
          image_url: string | null;
          type: Database["public"]["Enums"]["post_type"];
          video_url: string | null;
          youtube_id: string | null;
          youtube_title: string | null;
          youtube_channel: string | null;
          youtube_duration: string | null;
          news_title: string | null;
          news_content: string | null;
          event_id: string | null;
          metadata: Json | null;
        };
        Insert: {
          author_id: string;
          content: string;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          type?: Database["public"]["Enums"]["post_type"];
          video_url: string | null;
          youtube_id: string | null;
          youtube_title: string | null;
          youtube_channel: string | null;
          youtube_duration: string | null;
          news_title: string | null;
          news_content: string | null;
          event_id: string | null;
        };
        Update: {
          author_id?: string;
          content?: string;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          type?: Database["public"]["Enums"]["post_type"];
          video_url: string | null;
          youtube_id: string | null;
          youtube_title: string | null;
          youtube_channel: string | null;
          youtube_duration: string | null;
          news_title: string | null;
          news_content: string | null;
          event_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          cover_url: string | null;
          bio: string | null;
          created_at: string;
          display_name: string;
          id: string;
          username: string;
          location: string | null;
          status_message: string | null;
          online_status: string | null;
          visits_count: number | null;
          age: number | null;
        };
        Insert: {
          avatar_url?: string | null;
          cover_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          username: string;
          location?: string | null;
          status_message?: string | null;
          online_status?: string | null;
          visits_count?: number | null;
          age?: number | null;
        };
        Update: {
          avatar_url?: string | null;
          cover_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          username?: string;
          location?: string | null;
          status_message?: string | null;
          online_status?: string | null;
          visits_count?: number | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      record_visit: {
        Args: {
          p_profile_id: string;
          p_visitor_id?: string;
        };
        Returns: undefined;
      };
      increment_visit_count: {
        Args: {
          profile_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      event_attendee_status: "attending" | "interested";
      friendship_status: "pending" | "accepted";
      post_type:
        | "status"
        | "photo"
        | "video"
        | "music"
        | "event"
        | "news"
        | "poll"
        | "album"
        | "playlist"
        | "location"
        | "celebration";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      friendship_status: ["pending", "accepted"],
    },
  },
} as const;
