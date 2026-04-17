import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import PhotoCard from "@/components/PhotoCard";
import { samplePhotos } from "@/data/samplePhotos";
import { vibes } from "@/data/vibes";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Clock } from "lucide-react";

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

const HISTORY_KEY = "explore_search_history";
const MAX_HISTORY = 8;

const loadHistory = (): string[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [history, setHistory] = useState<string[]>(loadHistory);
  const [dbPhotos, setDbPhotos] = useState<DbPhoto[]>([]);
  const [hasSearched, setHasSearched] = useState(initialQuery.length > 0);

  useEffect(() => {
    supabase
      .from("photos")
      .select("id, image_url, caption, gear_name, aperture, iso, tags, user_id")
      .then(({ data }) => {
        if (data) setDbPhotos(data);
      });
  }, []);

  // If we landed with ?q=..., commit it once.
  useEffect(() => {
    if (initialQuery && !history.includes(initialQuery)) {
      saveToHistory(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToHistory = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const next = [trimmed, ...prev.filter((h) => h.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const removeHistoryItem = (q: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h !== q);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
  };

  const runSearch = (q: string) => {
    const trimmed = q.trim();
    setInputValue(trimmed);
    setActiveQuery(trimmed);
    setHasSearched(true);
    if (trimmed) {
      saveToHistory(trimmed);
      setSearchParams({ q: trimmed });
    } else {
      setSearchParams({});
    }
  };

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
    if (!activeQuery.trim()) return [];
    const q = activeQuery.toLowerCase();
    return allPhotos.filter(
      (p) =>
        (p.caption && p.caption.toLowerCase().includes(q)) ||
        p.username.toLowerCase().includes(q) ||
        p.gear.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q) || getVibeLabel(t).toLowerCase().includes(q)))
    );
  }, [activeQuery, allPhotos]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-16">
        <BackButton />
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
          <p className="mt-2 text-muted-foreground">
            Search photos by caption, photographer, gear, or vibe
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(inputValue);
          }}
          className="mx-auto mb-6 max-w-lg"
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search photos…"
                className="pl-10 pr-10"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => setInputValue("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" className="gradient-bg border-0 text-primary-foreground">
              Search
            </Button>
          </div>
        </form>

        {/* Search history */}
        {history.length > 0 && (
          <div className="mx-auto mb-10 max-w-lg">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Recent searches</span>
              <button
                onClick={clearHistory}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((h) => (
                <div
                  key={h}
                  className="group inline-flex items-center gap-1 rounded-full border border-border bg-secondary py-1 pl-3 pr-1 text-xs text-muted-foreground transition-colors hover:border-primary/50"
                >
                  <button
                    onClick={() => runSearch(h)}
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    <Clock className="h-3 w-3" />
                    {h}
                  </button>
                  <button
                    onClick={() => removeHistoryItem(h)}
                    className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
                    aria-label={`Remove ${h} from history`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasSearched ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">Type something and hit Search to explore photos.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No photos match "{activeQuery}"</p>
            <button
              onClick={() => runSearch("")}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
              {activeQuery && ` for "${activeQuery}"`}
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
