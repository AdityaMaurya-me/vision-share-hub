import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, FolderPlus, Check } from "lucide-react";

interface Collection {
  id: string;
  name: string;
}

interface AddToCollectionDialogProps {
  photoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddToCollectionDialog = ({ photoId, open, onOpenChange }: AddToCollectionDialogProps) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [memberships, setMemberships] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const { data: cols } = await supabase
        .from("collections")
        .select("id, name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (cols) setCollections(cols);

      const { data: mem } = await supabase
        .from("collection_photos")
        .select("collection_id")
        .eq("user_id", user.id)
        .eq("photo_id", photoId);
      if (mem) setMemberships(new Set(mem.map((m) => m.collection_id)));
    })();
  }, [open, user, photoId]);

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    const { data, error } = await supabase
      .from("collections")
      .insert({ user_id: user.id, name: newName.trim() })
      .select("id, name")
      .single();
    if (error || !data) {
      toast.error("Could not create collection");
      return;
    }
    setCollections((prev) => [data, ...prev]);
    setNewName("");
    setCreating(false);
    toast.success(`Created "${data.name}"`);
  };

  const toggleMembership = async (collectionId: string) => {
    if (!user) return;
    if (memberships.has(collectionId)) {
      await supabase
        .from("collection_photos")
        .delete()
        .eq("collection_id", collectionId)
        .eq("photo_id", photoId);
      setMemberships((prev) => {
        const n = new Set(prev);
        n.delete(collectionId);
        return n;
      });
      toast.success("Removed from collection");
    } else {
      const { error } = await supabase
        .from("collection_photos")
        .insert({ collection_id: collectionId, user_id: user.id, photo_id: photoId });
      if (error) {
        toast.error("Could not add to collection");
        return;
      }
      setMemberships((prev) => new Set(prev).add(collectionId));
      toast.success("Added to collection");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to collection</DialogTitle>
          <DialogDescription>Organize your saved photos into custom collections.</DialogDescription>
        </DialogHeader>

        <div className="max-h-64 space-y-1 overflow-y-auto">
          {collections.length === 0 && !creating && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No collections yet. Create your first one!
            </p>
          )}
          {collections.map((c) => {
            const isIn = memberships.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleMembership(c.id)}
                className="flex w-full items-center justify-between rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm transition-colors hover:bg-secondary"
              >
                <span className="flex items-center gap-2">
                  <FolderPlus className="h-4 w-4 text-muted-foreground" />
                  {c.name}
                </span>
                {isIn && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>

        {creating ? (
          <div className="flex gap-2">
            <Input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Collection name"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setCreating(false);
              }}
            />
            <Button onClick={handleCreate} disabled={!newName.trim()}>Create</Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setCreating(true)} className="w-full gap-2">
            <Plus className="h-4 w-4" /> New collection
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddToCollectionDialog;
