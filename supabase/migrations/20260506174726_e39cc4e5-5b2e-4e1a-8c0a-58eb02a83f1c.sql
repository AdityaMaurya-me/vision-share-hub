CREATE POLICY "Collections are viewable by everyone"
ON public.collections FOR SELECT
USING (true);

CREATE POLICY "Collection photos are viewable by everyone"
ON public.collection_photos FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users view own collections" ON public.collections;
DROP POLICY IF EXISTS "Users view own collection photos" ON public.collection_photos;