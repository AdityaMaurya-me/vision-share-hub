import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gearId: string;
  gearName: string;
  onSaved?: () => void;
}

interface Collection { id: string; name: string; }

const SaveToKitDialog = ({ open, onOpenChange, gearId, gearName, onSaved }: Props) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedColIds, setSavedColIds] = useState<Set<string>>(new Set());
  const [savedNoCol, setSavedNoCol] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const { data: cols } = await supabase
        .from("collections")
        .select("id, name")
        .eq("user_id", user.id)
        .eq("kind", "gears")
        .order("created_at", { ascending: false });
      setCollections(cols || []);
      const { data: kit } = await supabase
        .from("kit_gears")
        .select("collection_id")
        .eq("user_id", user.id)
        .eq("gear_id", gearId);
      const ids = new Set<string>();
      let noCol = false;
      (kit || []).forEach((k: any) => {
        if (k.collection_id) ids.add(k.collection_id); else noCol = true;
      });
      setSavedColIds(ids);
      setSavedNoCol(noCol);
    })();
  }, [open, user, gearId]);

  const toggleCollection = async (cid: string | null) => {
    if (!user) return;
    const isSaved = cid === null ? savedNoCol : savedColIds.has(cid);
    if (isSaved) {
      const q = supabase.from("kit_gears").delete().eq("user_id", user.id).eq("gear_id", gearId);
      const { error } = cid === null ? await q.is("collection_id", null) : await q.eq("collection_id", cid);
      if (error) { toast.error("Could not remove"); return; }
      if (cid === null) setSavedNoCol(false);
      else setSavedColIds((p) => { const n = new Set(p); n.delete(cid); return n; });
    } else {
      const { error } = await supabase.from("kit_gears").insert({ user_id: user.id, gear_id: gearId, collection_id: cid });
      if (error) { toast.error("Could not save"); return; }
      if (cid === null) setSavedNoCol(true);
      else setSavedColIds((p) => new Set(p).add(cid));
      onSaved?.();
      toast.success(`Added "${gearName}" to your kit`);
    }
  };

  const createCollection = async () => {
    if (!user || !newName.trim()) return;
    const { data, error } = await supabase
      .from("collections")
      .insert({ user_id: user.id, name: newName.trim(), kind: "gears" })
      .select("id, name").single();
    if (error || !data) { toast.error("Could not create"); return; }
    setCollections((p) => [data, ...p]);
    setNewName(""); setCreating(false);
    await toggleCollection(data.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to My Kit</DialogTitle>
          <DialogDescription>Pick a kit collection (or save without one).</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          <button
            onClick={() => toggleCollection(null)}
            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${savedNoCol ? "border-primary bg-primary/10" : "border-border bg-secondary"}`}
          >
            <span className="flex items-center gap-2"><Folder className="h-4 w-4" /> My Kit (no collection)</span>
            {savedNoCol && <span className="text-xs text-primary">Saved</span>}
          </button>
          {collections.map((c) => {
            const saved = savedColIds.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleCollection(c.id)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${saved ? "border-primary bg-primary/10" : "border-border bg-secondary"}`}
              >
                <span className="flex items-center gap-2"><Folder className="h-4 w-4" /> {c.name}</span>
                {saved && <span className="text-xs text-primary">Saved</span>}
              </button>
            );
          })}
        </div>
        {creating ? (
          <div className="flex gap-2">
            <Input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New collection name" onKeyDown={(e) => { if (e.key === "Enter") createCollection(); }} />
            <Button onClick={createCollection} disabled={!newName.trim()}>Create</Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setCreating(true)} className="gap-1.5 w-fit">
            <Plus className="h-3.5 w-3.5" /> New collection
          </Button>
        )}
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveToKitDialog;
