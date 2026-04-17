import { useState, useEffect } from "react";
import useScrollRestore from "@/hooks/useScrollRestore";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import PhotoCard from "@/components/PhotoCard";
import { samplePhotos } from "@/data/samplePhotos";
import { vibes } from "@/data/vibes";
import { supabase } from "@/integrations/supabase/client";

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

const VibeMatcher = () => {
  useScrollRestore();
  const [searchParams] = useSearchParams();
  const initialVibe = searchParams.get("vibe");
  const [selected, setSelected] = useState<string[]>(initialVibe ? [initialVibe] : []);
  // Vibes user has actually committed via "Find My Gear"
  const [appliedVibes, setAppliedVibes] = useState<string[]>(initialVibe ? [initialVibe] : []);
  const [dbPhotos, setDbPhotos] = useState<DbPhoto[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase.from("photos").select("id, image_url, caption, gear_name, aperture, iso, tags, user_id");
      if (data) {
        setDbPhotos(data as DbPhoto[]);
        const userIds = [...new Set(data.map((p: any) => p.user_id))];
        if (userIds.length > 0) {
          const { data: profileData } = await supabase.from("profiles").select("user_id, username").in("user_id", userIds);
          if (profileData) {
            const map: Record<string, string> = {};
            profileData.forEach((p: any) => { map[p.user_id] = p.username || "user"; });
            setProfiles(map);
          }
        }
      }
    };
    fetchPhotos();
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const filteredSample = appliedVibes.length === 0
    ? []
    : samplePhotos.filter((p) => p.tags?.some((t) => appliedVibes.includes(t)));

  const filteredDb = appliedVibes.length === 0
    ? []
    : dbPhotos.filter((p) => p.tags?.some((t) => appliedVibes.includes(t)));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-16">
        <BackButton />
        <h1 className="text-3xl font-bold">Vibe Matcher</h1>
        <p className="mt-2 text-muted-foreground">
          Select your creative goals and we'll find the best gear for you.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {vibes.map((vibe) => {
            const isActive = selected.includes(vibe.id);
            return (
              <button
                key={vibe.id}
                onClick={() => toggle(vibe.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-6 transition-all ${
                  isActive
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-surface-hover"
                }`}
              >
                <span className="text-3xl">{vibe.emoji}</span>
                <span className="text-sm font-medium">{vibe.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            disabled={selected.length === 0}
            className="gradient-bg border-0 text-primary-foreground disabled:opacity-40"
            onClick={() => setAppliedVibes(selected)}
          >
            Find My Gear
          </Button>
          {(selected.length > 0 || appliedVibes.length > 0) && (
            <Button variant="outline" onClick={() => { setSelected([]); setAppliedVibes([]); }}>
              Reset All
            </Button>
          )}
        </div>

        {appliedVibes.length > 0 && (filteredSample.length > 0 || filteredDb.length > 0) && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">
              Matching Photos ({filteredSample.length + filteredDb.length})
            </h2>
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {filteredSample.map((p) => (
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
              {filteredDb.map((p) => (
                <PhotoCard
                  key={p.id}
                  id={p.id}
                  image={p.image_url}
                  caption={p.caption || ""}
                  username={profiles[p.user_id] || "user"}
                  gear={p.gear_name || ""}
                  aperture={p.aperture || ""}
                  iso={p.iso || ""}
                />
              ))}
            </div>
          </div>
        )}

        {appliedVibes.length > 0 && filteredSample.length === 0 && filteredDb.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">
            No photos match your selected vibes yet.
          </p>
        )}
        {selected.length === 0 && appliedVibes.length === 0 && (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Pick one or more vibes above, then hit <span className="text-foreground">Find My Gear</span>.
          </p>
        )}
      </main>
    </div>
  );
};

export default VibeMatcher;
