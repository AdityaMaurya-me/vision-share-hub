import { useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const vibes = [
  { id: "cinematic", emoji: "🎬", label: "Cinematic Films" },
  { id: "lowlight", emoji: "🌙", label: "Low Light & Night" },
  { id: "portrait", emoji: "🎭", label: "Portrait Sessions" },
  { id: "street", emoji: "🏙️", label: "Street Photography" },
  { id: "vlogging", emoji: "📱", label: "Vlogging & Content" },
  { id: "film", emoji: "🎞️", label: "Film Aesthetic" },
  { id: "sports", emoji: "⚡", label: "Sports & Action" },
  { id: "travel", emoji: "✈️", label: "Travel Photography" },
];

const VibeMatcher = () => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-16">
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

        <div className="mt-8">
          <Button
            disabled={selected.length === 0}
            className="gradient-bg border-0 text-primary-foreground disabled:opacity-40"
          >
            Find My Gear
          </Button>
        </div>
      </main>
    </div>
  );
};

export default VibeMatcher;
