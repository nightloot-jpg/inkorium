-- Modify profiles
ALTER TABLE public.profiles ADD COLUMN location TEXT;
ALTER TABLE public.profiles ADD COLUMN status_message TEXT;
ALTER TABLE public.profiles ADD COLUMN visits_count INT DEFAULT 0;

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  location TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX events_author_idx ON public.events (author_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_select_all" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_insert_self" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "events_delete_self" ON public.events FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Modify posts table
CREATE TYPE public.post_type AS ENUM ('status', 'photo', 'video', 'music', 'event', 'news');
ALTER TABLE public.posts ADD COLUMN type public.post_type NOT NULL DEFAULT 'status';
ALTER TABLE public.posts ADD COLUMN video_url TEXT;
ALTER TABLE public.posts ADD COLUMN youtube_id TEXT;
ALTER TABLE public.posts ADD COLUMN youtube_title TEXT;
ALTER TABLE public.posts ADD COLUMN youtube_channel TEXT;
ALTER TABLE public.posts ADD COLUMN youtube_duration TEXT;
ALTER TABLE public.posts ADD COLUMN news_title TEXT;
ALTER TABLE public.posts ADD COLUMN news_content TEXT;
ALTER TABLE public.posts ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;
