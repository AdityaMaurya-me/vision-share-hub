
CREATE TABLE public.saved_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  photo_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, photo_id)
);

ALTER TABLE public.saved_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved photos"
ON public.saved_photos
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save photos"
ON public.saved_photos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave photos"
ON public.saved_photos
FOR DELETE
USING (auth.uid() = user_id);
