import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload as UploadIcon, X, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { vibes } from "@/data/vibes";
import BackButton from "@/components/BackButton";
import { GEAR_TYPES, GearType, slugify, guessGearType } from "@/lib/gear";

interface GearItem { name: string; type: GearType; }

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [gearItems, setGearItems] = useState<GearItem[]>([{ name: "", type: "camera" }]);
  const [aperture, setAperture] = useState("");
  const [shutterSpeed, setShutterSpeed] = useState("");
  const [iso, setIso] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<{ imageUrl: string } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const removeFile = () => {
    setFile(null); setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleTag = (id: string) => {
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  const updateGear = (i: number, patch: Partial<GearItem>) => {
    setGearItems((prev) => prev.map((g, idx) => idx === i ? { ...g, ...patch } : g));
  };
  const addGear = () => setGearItems((p) => [...p, { name: "", type: "accessory" }]);
  const removeGear = (i: number) => setGearItems((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;
    if (selectedTags.length === 0) { toast.error("Please select at least one photo category"); return; }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("photos").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(filePath);

      const cleanGears = gearItems.filter((g) => g.name.trim());
      const gearJoined = cleanGears.map((g) => g.name.trim()).join(" + ");

      const { data: photoRow, error: insertError } = await supabase.from("photos").insert({
        user_id: user.id,
        image_url: urlData.publicUrl,
        caption: caption || null,
        gear_name: gearJoined || null,
        aperture: aperture || null,
        shutter_speed: shutterSpeed || null,
        iso: iso || null,
        tags: selectedTags,
      }).select("id").single();
      if (insertError || !photoRow) throw insertError;

      // Upsert gears + link to photo
      for (const g of cleanGears) {
        const slug = slugify(g.name);
        const type = g.type || guessGearType(g.name);
        let { data: existing } = await supabase.from("gears").select("id").eq("slug", slug).maybeSingle();
        if (!existing) {
          const { data: created } = await supabase
            .from("gears")
            .insert({ slug, name: g.name.trim(), gear_type: type, created_by: user.id })
            .select("id").single();
          existing = created;
        }
        if (existing) {
          await supabase.from("photo_gears").insert({ photo_id: photoRow.id, gear_id: existing.id });
        }
      }

      setSuccess({ imageUrl: urlData.publicUrl });
      toast.success("Photo uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container pt-24 pb-16 flex flex-col items-center">
          <div className="max-w-lg w-full text-center space-y-6">
            <div className="rounded-xl overflow-hidden border border-border">
              <img src={success.imageUrl} alt="Uploaded" className="w-full" />
              {caption && <p className="p-4 text-sm italic text-muted-foreground">{caption}</p>}
            </div>
            <h2 className="text-2xl font-bold">Your shot is live 🎉</h2>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/profile")}>See it in your profile</Button>
              <Button
                className="gradient-bg border-0 text-primary-foreground"
                onClick={() => {
                  setSuccess(null); setFile(null); setPreview(null); setCaption("");
                  setGearItems([{ name: "", type: "camera" }]);
                  setAperture(""); setShutterSpeed(""); setIso(""); setSelectedTags([]);
                }}
              >Upload another</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-16">
        <div className="max-w-xl mx-auto">
          <BackButton />
          <h1 className="text-3xl font-bold mb-2">Share a Shot</h1>
          <p className="text-muted-foreground mb-8">Upload your best work and let the community see what your gear can do.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!preview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground"
              >
                <ImagePlus className="h-10 w-10" />
                <span className="text-sm font-medium">Click to select a photo</span>
                <span className="text-xs text-muted-foreground">JPG, PNG, WEBP up to 10MB</span>
              </button>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={preview} alt="Preview" className="w-full max-h-96 object-cover" />
                <button type="button" onClick={removeFile} className="absolute top-3 right-3 bg-destructive text-destructive-foreground rounded-full p-1.5 hover:opacity-80 transition-opacity">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />

            <div className="space-y-2">
              <Label>Photo Category *</Label>
              <p className="text-xs text-muted-foreground">Select one or more categories that best describe your photo.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {vibes.map((vibe) => {
                  const isActive = selectedTags.includes(vibe.id);
                  return (
                    <button
                      key={vibe.id} type="button" onClick={() => toggleTag(vibe.id)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${isActive ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary text-muted-foreground hover:border-primary/30"}`}
                    >
                      <span>{vibe.emoji}</span>
                      <span className="font-medium truncate">{vibe.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">What were you trying to capture?</Label>
              <Textarea id="caption" placeholder="Describe the vibe, the moment, the story…" value={caption} onChange={(e) => setCaption(e.target.value)} className="bg-secondary border-border" />
            </div>

            {/* Gear list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Gear used</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addGear} className="gap-1 h-7">
                  <Plus className="h-3.5 w-3.5" /> Add item
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">List every item you used: camera body, lens, phone, lighting, accessories…</p>
              {gearItems.map((g, i) => (
                <div key={i} className="flex gap-2">
                  <select
                    value={g.type}
                    onChange={(e) => updateGear(i, { type: e.target.value as GearType })}
                    className="rounded-md border border-border bg-secondary px-2 py-2 text-sm w-36"
                  >
                    {GEAR_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <Input
                    value={g.name}
                    onChange={(e) => updateGear(i, { name: e.target.value })}
                    placeholder={g.type === "lens" ? "85mm f/1.4 GM" : g.type === "camera" ? "Sony A7 IV" : "Item name"}
                    className="flex-1 bg-secondary"
                  />
                  {gearItems.length > 1 && (
                    <button type="button" onClick={() => removeGear(i)} className="text-muted-foreground hover:text-destructive px-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Settings */}
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Aperture</Label><Input value={aperture} onChange={(e) => setAperture(e.target.value)} placeholder="f/1.4" className="bg-secondary" /></div>
              <div><Label>Shutter</Label><Input value={shutterSpeed} onChange={(e) => setShutterSpeed(e.target.value)} placeholder="1/250" className="bg-secondary" /></div>
              <div><Label>ISO</Label><Input value={iso} onChange={(e) => setIso(e.target.value)} placeholder="100" className="bg-secondary" /></div>
            </div>

            <Button type="submit" disabled={!file || uploading} className="w-full gradient-bg border-0 text-primary-foreground">
              {uploading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>) : (<><UploadIcon className="h-4 w-4" /> Share this shot</>)}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Upload;
