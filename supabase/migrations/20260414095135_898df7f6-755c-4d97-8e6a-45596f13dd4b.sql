
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  gear_name TEXT,
  aperture TEXT,
  shutter_speed TEXT,
  iso TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view photos"
ON public.photos FOR SELECT USING (true);

CREATE POLICY "Users can insert their own photos"
ON public.photos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos"
ON public.photos FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
ON public.photos FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_photos_updated_at
BEFORE UPDATE ON public.photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
