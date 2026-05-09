import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Bookmark, BookmarkCheck, ExternalLink, Plus, Trash2, Pencil, Camera, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import SaveToKitDialog from "@/components/SaveToKitDialog";
import { GEAR_TYPES } from "@/lib/gear";

interface Gear {
  id: string; slug: string; name: string; gear_type: string;
  image_url: string | null; description: string | null; created_by: string | null;
}
interface Retailer { id: string; retailer: string; price: string | null; url: string; created_by: string | null; }
interface PhotoRow { id: string; image_url: string; caption: string | null; }

const GearDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [gear, setGear] = useState<Gear | null>(null);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedAny, setSavedAny] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showAddRetailer, setShowAddRetailer] = useState(false);
  const [newRet, setNewRet] = useState({ retailer: "", price: "", url: "" });
  const [edit, setEdit] = useState({ image_url: "", description: "", gear_type: "other" });

  const loadAll = async () => {
    if (!slug) return;
    setLoading(true);
    let { data: g } = await supabase
      .from("gears")
      .select("id, slug, name, gear_type, image_url, description, created_by")
      .eq("slug", slug)
      .maybeSingle();

    // Auto-create a stub if a signed-in user lands on a missing slug
    // (e.g. coming from a sample-photo gear link)
    if (!g && user) {
      const name = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const { guessGearType } = await import("@/lib/gear");
      const { data: created } = await supabase
        .from("gears")
        .insert({ slug, name, gear_type: guessGearType(name), created_by: user.id })
        .select("id, slug, name, gear_type, image_url, description, created_by")
        .single();
      g = created;
    }

    setGear(g);
    if (g) {
      setEdit({ image_url: g.image_url || "", description: g.description || "", gear_type: g.gear_type });
      const [{ data: rs }, { data: pgs }] = await Promise.all([
        supabase.from("gear_retailers").select("*").eq("gear_id", g.id).order("created_at"),
        supabase.from("photo_gears").select("photos:photo_id(id, image_url, caption)").eq("gear_id", g.id).limit(12),
      ]);
      setRetailers(rs || []);
      // @ts-ignore relational join
      setPhotos((pgs || []).map((r: any) => r.photos).filter(Boolean));
      if (user) {
        const { data: kit } = await supabase
          .from("kit_gears")
          .select("id")
          .eq("user_id", user.id)
          .eq("gear_id", g.id)
          .limit(1);
        setSavedAny((kit || []).length > 0);
      }
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [slug, user]);

  const handleAddRetailer = async () => {
    if (!user || !gear || !newRet.retailer.trim() || !newRet.url.trim()) return;
    const { data, error } = await supabase
      .from("gear_retailers")
      .insert({ gear_id: gear.id, retailer: newRet.retailer.trim(), price: newRet.price || null, url: newRet.url.trim(), created_by: user.id })
      .select("*").single();
    if (error || !data) { toast.error("Could not add link"); return; }
    setRetailers((p) => [...p, data]);
    setNewRet({ retailer: "", price: "", url: "" });
    setShowAddRetailer(false);
    toast.success("Buy link added");
  };

  const handleDeleteRetailer = async (id: string) => {
    await supabase.from("gear_retailers").delete().eq("id", id);
    setRetailers((p) => p.filter((r) => r.id !== id));
  };

  const handleSaveEdit = async () => {
    if (!gear) return;
    const { error } = await supabase
      .from("gears")
      .update({ image_url: edit.image_url || null, description: edit.description || null, gear_type: edit.gear_type })
      .eq("id", gear.id);
    if (error) { toast.error("Update failed"); return; }
    setGear({ ...gear, image_url: edit.image_url || null, description: edit.description || null, gear_type: edit.gear_type });
    setEditing(false);
    toast.success("Updated");
  };

  if (loading) return (<div className="min-h-screen bg-background"><Navbar /><div className="container pt-24 text-muted-foreground">Loading…</div></div>);

  if (!gear) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24"><BackButton />
        <div className="py-16 text-center">
          <h1 className="text-2xl font-bold">Gear not found</h1>
          <Link to="/gears" className="mt-3 inline-block text-sm text-primary hover:underline">← All gears</Link>
        </div>
      </div>
    </div>
  );

  const canEdit = user && gear.created_by === user.id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-5xl pt-24 pb-16">
        <BackButton />

        <div className="grid gap-8 md:grid-cols-[420px_1fr]">
          <div className="overflow-hidden rounded-xl border border-border bg-secondary/30">
            <div className="aspect-square flex items-center justify-center">
              {gear.image_url ? (
                <img src={gear.image_url} alt={gear.name} className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-20 w-20 text-muted-foreground/40" />
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{gear.gear_type}</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">{gear.name}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => {
                  if (!user) { toast.error("Log in to save gear to your kit"); return; }
                  setShowSaveDialog(true);
                }}
                className="gap-2"
                variant={savedAny ? "secondary" : "default"}
              >
                {savedAny ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                {savedAny ? "In your Kit" : "Save to My Kit"}
              </Button>
              {canEdit && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">About</h3>
              <p className="text-sm text-muted-foreground">
                {gear.description || (canEdit ? "Add a description so others can learn about this gear." : "No description yet.")}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Where to buy</h3>
                {user && (
                  <Button size="sm" variant="ghost" onClick={() => setShowAddRetailer(true)} className="gap-1 h-7">
                    <Plus className="h-3.5 w-3.5" /> Add link
                  </Button>
                )}
              </div>
              {retailers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No buying links yet.</p>
              ) : (
                <ul className="space-y-2">
                  {retailers.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg bg-secondary px-3 py-2">
                      <a href={r.url} target="_blank" rel="noreferrer" className="flex flex-1 items-center gap-2 text-sm hover:text-primary">
                        <ExternalLink className="h-3.5 w-3.5" /> <span className="font-medium">{r.retailer}</span>
                        {r.price && <span className="ml-auto text-muted-foreground">{r.price}</span>}
                      </a>
                      {user && r.created_by === user.id && (
                        <button onClick={() => handleDeleteRetailer(r.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {photos.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Shot with this gear</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((p) => (
                <Link key={p.id} to={`/photo/${p.id}`} className="group overflow-hidden rounded-lg border border-border">
                  <img src={p.image_url} alt={p.caption || ""} className="aspect-square w-full object-cover transition-transform group-hover:scale-105" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <SaveToKitDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        gearId={gear.id}
        gearName={gear.name}
        onSaved={() => setSavedAny(true)}
      />

      <Dialog open={showAddRetailer} onOpenChange={setShowAddRetailer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a buy link</DialogTitle>
            <DialogDescription>Help others find this gear from a trusted retailer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Retailer</Label><Input value={newRet.retailer} onChange={(e) => setNewRet({ ...newRet, retailer: e.target.value })} placeholder="B&H Photo, Amazon…" /></div>
            <div><Label>Price (optional)</Label><Input value={newRet.price} onChange={(e) => setNewRet({ ...newRet, price: e.target.value })} placeholder="$1,999" /></div>
            <div><Label>URL</Label><Input value={newRet.url} onChange={(e) => setNewRet({ ...newRet, url: e.target.value })} placeholder="https://…" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddRetailer(false)}>Cancel</Button>
            <Button onClick={handleAddRetailer} disabled={!newRet.retailer.trim() || !newRet.url.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit gear</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Type</Label>
              <select
                value={edit.gear_type}
                onChange={(e) => setEdit({ ...edit, gear_type: e.target.value })}
                className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm"
              >
                {GEAR_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div><Label>Image URL</Label><Input value={edit.image_url} onChange={(e) => setEdit({ ...edit, image_url: e.target.value })} placeholder="https://…" /></div>
            <div><Label>Description</Label><Textarea value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} placeholder="Specs, why you love it…" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GearDetail;
