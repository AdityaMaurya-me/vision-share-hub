import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { Input } from "@/components/ui/input";
import { Camera, Aperture, Smartphone, Plane, Lightbulb, Mic, Wrench, Search, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GEAR_TYPES, GearType } from "@/lib/gear";

const TYPE_ICON: Record<string, any> = {
  camera: Camera, lens: Aperture, phone: Smartphone, drone: Plane,
  lighting: Lightbulb, audio: Mic, tripod: Wrench, accessory: Package, other: Package,
};

interface Gear {
  id: string; slug: string; name: string; gear_type: string; image_url: string | null;
}

const Gears = () => {
  const [gears, setGears] = useState<Gear[]>([]);
  const [q, setQ] = useState("");
  const [activeType, setActiveType] = useState<GearType | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("gears")
        .select("id, slug, name, gear_type, image_url")
        .order("name");
      setGears(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = gears.filter((g) => {
    if (activeType !== "all" && g.gear_type !== activeType) return false;
    if (q && !g.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Gear catalog — VisionX</title>
        <meta name="description" content="Browse cameras, lenses, phones and accessories used by the VisionX community. See real shots taken with each piece of gear." />
        <link rel="canonical" href="/gears" />
      </Helmet>
      <Navbar />
      <main className="container pt-24 pb-16">
        <BackButton />
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Gears</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cameras, lenses, phones and accessories from the community. Save anything to your Kit.
          </p>
        </header>

        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search gear…" className="pl-9 bg-secondary" />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveType("all")}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${activeType === "all" ? "border-primary bg-primary/10" : "border-border bg-secondary text-muted-foreground"}`}
          >
            All
          </button>
          {GEAR_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveType(t.value)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${activeType === t.value ? "border-primary bg-primary/10" : "border-border bg-secondary text-muted-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Package className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p className="text-lg font-medium">No gear yet</p>
            <p className="text-sm">Gear added by uploaders will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((g) => {
              const Icon = TYPE_ICON[g.gear_type] || Package;
              return (
                <Link
                  key={g.id}
                  to={`/gears/${g.slug}`}
                  className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50"
                >
                  <div className="aspect-square bg-secondary/50 flex items-center justify-center overflow-hidden">
                    {g.image_url ? (
                      <img src={g.image_url} alt={g.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <Icon className="h-12 w-12 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{g.gear_type}</p>
                    <p className="mt-1 font-semibold leading-tight">{g.name}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Gears;
