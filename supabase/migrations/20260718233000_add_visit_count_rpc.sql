CREATE OR REPLACE FUNCTION increment_visit_count(profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET visits_count = COALESCE(visits_count, 0) + 1
  WHERE id = profile_id;
END;
$$;
