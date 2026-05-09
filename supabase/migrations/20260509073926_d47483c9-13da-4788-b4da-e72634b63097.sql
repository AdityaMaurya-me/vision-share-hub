
-- ============ GEARS CATALOG ============
CREATE TABLE public.gears (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  gear_type TEXT NOT NULL DEFAULT 'other',
  image_url TEXT,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gears ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gears are viewable by everyone" ON public.gears FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add gears" ON public.gears FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);
CREATE POLICY "Creators can update their gears" ON public.gears FOR UPDATE USING (auth.uid() = created_by);

CREATE TRIGGER trg_gears_updated_at BEFORE UPDATE ON public.gears
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_gears_type ON public.gears(gear_type);
CREATE INDEX idx_gears_name ON public.gears(name);

-- ============ GEAR RETAILERS ============
CREATE TABLE public.gear_retailers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gear_id UUID NOT NULL REFERENCES public.gears(id) ON DELETE CASCADE,
  retailer TEXT NOT NULL,
  price TEXT,
  url TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gear_retailers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Retailers viewable by everyone" ON public.gear_retailers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add retailers" ON public.gear_retailers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);
CREATE POLICY "Creators can update their retailers" ON public.gear_retailers FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete their retailers" ON public.gear_retailers FOR DELETE USING (auth.uid() = created_by);

CREATE INDEX idx_gear_retailers_gear ON public.gear_retailers(gear_id);

-- ============ PHOTO <-> GEAR LINK ============
CREATE TABLE public.photo_gears (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  gear_id UUID NOT NULL REFERENCES public.gears(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(photo_id, gear_id)
);
ALTER TABLE public.photo_gears ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photo gears viewable by everyone" ON public.photo_gears FOR SELECT USING (true);
CREATE POLICY "Photo owner can attach gears" ON public.photo_gears FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.photos p WHERE p.id = photo_id AND p.user_id = auth.uid()));
CREATE POLICY "Photo owner can detach gears" ON public.photo_gears FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.photos p WHERE p.id = photo_id AND p.user_id = auth.uid()));

CREATE INDEX idx_photo_gears_photo ON public.photo_gears(photo_id);
CREATE INDEX idx_photo_gears_gear ON public.photo_gears(gear_id);

-- ============ KIND ON COLLECTIONS ============
ALTER TABLE public.collections ADD COLUMN kind TEXT NOT NULL DEFAULT 'photos';

-- ============ KIT GEARS ============
CREATE TABLE public.kit_gears (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  gear_id UUID NOT NULL REFERENCES public.gears(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, gear_id, collection_id)
);
ALTER TABLE public.kit_gears ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own kit" ON public.kit_gears FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users add to their own kit" ON public.kit_gears FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update their own kit" ON public.kit_gears FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users remove from their own kit" ON public.kit_gears FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_kit_gears_user ON public.kit_gears(user_id);
CREATE INDEX idx_kit_gears_gear ON public.kit_gears(gear_id);
