import { Link, useNavigate } from "react-router-dom";
import { MoreHorizontal, Bookmark, Download, Flag, FolderPlus } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import AddToCollectionDialog from "@/components/AddToCollectionDialog";
import ReportDialog from "@/components/ReportDialog";

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
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
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

  const handleDownload = async (e: Event) => {
    e.preventDefault();
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `visionx-${id}.jpg`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Download started");
    } catch {
      toast.error("Failed to download");
    }
  };

  const handleAddToCollection = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setShowCollectionDialog(true);
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-background/60 text-foreground transition-colors hover:bg-background/80"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onSelect={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleAddToCollection(); }} className="gap-2">
                  <FolderPlus className="h-4 w-4" />
                  Add to collection
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => { e.preventDefault(); setShowReportDialog(true); }}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Flag className="h-4 w-4" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              You need to be logged in to do that. Please log in or create an account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button onClick={() => navigate("/login")} className="w-full">Log In</Button>
            <Button variant="outline" onClick={() => navigate("/signup")} className="w-full">Sign Up</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddToCollectionDialog
        photoId={id}
        open={showCollectionDialog}
        onOpenChange={setShowCollectionDialog}
      />

      <ReportDialog open={showReportDialog} onOpenChange={setShowReportDialog} photoId={id} />
    </>
  );
};

export default PhotoCard;
