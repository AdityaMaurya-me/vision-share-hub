import { useState, useEffect, useMemo } from "react";
import PhotoCard from "./PhotoCard";
import { samplePhotos } from "@/data/samplePhotos";
import { supabase } from "@/integrations/supabase/client";

interface DbPhoto {
  id: string;
  image_url: string;
  caption: string | null;
  gear_name: string | null;
  aperture: string | null;
  iso: string | null;
  user_id: string;
}

const PhotoGrid = () => {
  const [dbPhotos, setDbPhotos] = useState<DbPhoto[]>([]);

  useEffect(() => {
    supabase
      .from("photos")
      .select("id, image_url, caption, gear_name, aperture, iso, user_id")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setDbPhotos(data);
      });
  }, []);

  const allPhotos = useMemo(() => {
    const uploaded = dbPhotos.map((p) => ({
      id: `db-${p.id}`,
      image: p.image_url,
      caption: p.caption || "",
      username: p.user_id.slice(0, 8),
      gear: p.gear_name || "Unknown",
      aperture: p.aperture || undefined,
      iso: p.iso || undefined,
    }));
    return [...samplePhotos, ...uploaded];
  }, [dbPhotos]);

  return (
    <section className="container py-10">
      <div className="masonry-grid">
        {allPhotos.map((photo) => (
          <PhotoCard key={photo.id} {...photo} />
        ))}
      </div>
    </section>
  );
};

export default PhotoGrid;
