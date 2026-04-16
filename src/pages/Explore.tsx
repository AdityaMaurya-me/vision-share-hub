import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PhotoCard from "@/components/PhotoCard";
import { samplePhotos } from "@/data/samplePhotos";
import { vibes } from "@/data/vibes";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface DbPhoto {
  id: string;
  image_url: string;
  caption: string | null;
  gear_name: string | null;
  aperture: string | null;
  iso: string | null;
  tags: string[] | null;
  user_id: string;
}

const Explore = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [dbPhotos, setDbPhotos] = useState<DbPhoto[]>([]);

  useEffect(() => {
    supabase
      .from("photos")
      .select("id, image_url, caption, gear_name, aperture, iso, tags, user_id")
      .then(({ data }) => {
        if (data) setDbPhotos(data);
      });
  }, []);

  const allPhotos = useMemo(() => {
    const mapped = dbPhotos.map((p) => ({
      id: `db-${p.id}`,
      image: p.image_url,
      caption: p.caption || "",
      username: p.user_id.slice(0, 8),
      gear: p.gear_name || "Unknown",
      aperture: p.aperture || undefined,
      iso: p.iso || undefined,
      tags: p.tags || [],
    }));
    const sample = samplePhotos.map((p) => ({ ...p, tags: p.tags || [] }));
    return [...sample, ...mapped];
  }, [dbPhotos]);

  const getVibeLabel = (tagId: string) => {
    const v = vibes.find((vb) => vb.id === tagId);
    return v ? v.label : tagId;
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return allPhotos;
    const q = query.toLowerCase();
    return allPhotos.filter(
      (p) =>
        (p.caption && p.caption.toLowerCase().includes(q)) ||
        p.username.toLowerCase().includes(q) ||
        p.gear.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q) || getVibeLabel(t).toLowerCase().includes(q)))
    );
  }, [query, allPhotos]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
          <p className="mt-2 text-muted-foreground">
            Search photos by caption, photographer, gear, or vibe
          </p>
        </div>

        <div className="mx-auto mb-10 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search photos…"
              className="pl-10 pr-10"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No photos match "{query}"</p>
            <button
              onClick={() => setQuery("")}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
              {query && ` for "${query}"`}
            </p>
            <div className="masonry-grid">
              {filtered.map((p) => (
                <PhotoCard
                  key={p.id}
                  id={p.id}
                  image={p.image}
                  caption={p.caption}
                  username={p.username}
                  gear={p.gear}
                  aperture={p.aperture}
                  iso={p.iso}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Explore;
