
CREATE TABLE public.collections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own collections" ON public.collections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own collections" ON public.collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own collections" ON public.collections
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own collections" ON public.collections
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.collection_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  photo_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (collection_id, photo_id)
);

ALTER TABLE public.collection_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own collection photos" ON public.collection_photos
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users add to own collections" ON public.collection_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove from own collections" ON public.collection_photos
  FOR DELETE USING (auth.uid() = user_id);
