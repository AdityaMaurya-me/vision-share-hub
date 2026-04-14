import { Link } from "react-router-dom";
import { MoreHorizontal, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PhotoCardProps {
  id: string;
  image: string;
  caption?: string;
  username: string;
  gear: string;
  aperture?: string;
  iso?: string;
}

const PhotoCard = ({ id, image, caption, username, gear, aperture, iso }: PhotoCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_photos")
      .select("id")
      .eq("user_id", user.id)
      .eq("photo_id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSaved(true);
      });
  }, [user, id]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    if (saved) {
      await supabase.from("saved_photos").delete().eq("user_id", user.id).eq("photo_id", id);
      setSaved(false);
      toast.success("Removed from saved");
    } else {
      await supabase.from("saved_photos").insert({ user_id: user.id, photo_id: id });
      setSaved(true);
      toast.success("Saved to collection");
    }
  };

  return (
    <>
      <div
        className="masonry-item group relative overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-surface-hover"
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        {showMenu && (
          <div className="absolute right-2 top-2 z-10 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={handleSave}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-background/60 text-foreground transition-colors hover:bg-background/80"
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-background/60 text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        )}

        <Link to={`/photo/${id}`}>
          <img
            src={image}
            alt={caption || "Community photo"}
            className="w-full cursor-pointer object-cover transition-opacity hover:opacity-90"
            loading="lazy"
          />
        </Link>

        <div className="p-3">
          {caption && (
            <p className="text-sm italic text-text-secondary">{caption}</p>
          )}
          <Link
            to={`/${username}`}
            className="mt-1 block text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            @{username}
          </Link>
          <p className="text-xs text-text-hint">{gear}</p>

          {(aperture || iso) && (
            <div className="mt-2 flex gap-2">
              {aperture && (
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  {aperture}
                </span>
              )}
              {iso && (
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  ISO {iso}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign in to save photos</DialogTitle>
            <DialogDescription>
              You need to be logged in to save photos. Please log in or create an account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button onClick={() => navigate("/login")} className="w-full">Log In</Button>
            <Button variant="outline" onClick={() => navigate("/signup")} className="w-full">Sign Up</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoCard;
