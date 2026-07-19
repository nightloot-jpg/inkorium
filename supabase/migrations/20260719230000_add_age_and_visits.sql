ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INT;

CREATE TABLE IF NOT EXISTS public.profile_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, visitor_id)
);

CREATE INDEX IF NOT EXISTS profile_visits_profile_id_idx ON public.profile_visits(profile_id);

ALTER TABLE public.profile_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile_visits_select_all" ON public.profile_visits FOR SELECT TO authenticated USING (true);
CREATE POLICY "profile_visits_insert" ON public.profile_visits FOR INSERT TO authenticated WITH CHECK (auth.uid() = visitor_id);
CREATE POLICY "profile_visits_update" ON public.profile_visits FOR UPDATE TO authenticated USING (auth.uid() = visitor_id);

CREATE OR REPLACE FUNCTION record_visit(p_profile_id uuid, p_visitor_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET visits_count = COALESCE(visits_count, 0) + 1
  WHERE id = p_profile_id;

  IF p_visitor_id IS NOT NULL THEN
    INSERT INTO public.profile_visits (profile_id, visitor_id)
    VALUES (p_profile_id, p_visitor_id)
    ON CONFLICT (profile_id, visitor_id)
    DO UPDATE SET visited_at = now();
  END IF;
END;
$$;
