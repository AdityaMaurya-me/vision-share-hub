import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import PhotoCard from "@/components/PhotoCard";
import { samplePhotos } from "@/data/samplePhotos";
import { vibes } from "@/data/vibes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft, UserPlus, Send, Camera, Aperture, Gauge,
  Heart, Share2, Bookmark, MoreHorizontal, Download, Flag, Trash2, Aperture as LensIcon,
} from "lucide-react";
import BackButton from "@/components/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect } from "react";

const PhotoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const photo = samplePhotos.find((p) => p.id === id);
  const [commentText, setCommentText] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogMessage, setAuthDialogMessage] = useState("You need to be logged in. Please log in or create an account.");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState<{ id: string; user: string; text: string; isMine?: boolean; likes: number; likedByMe: boolean }[]>([
    { id: "c1", user: "pixel_hunter", text: "Incredible composition! The light is perfect.", likes: 3, likedByMe: false },
    { id: "c2", user: "analog_soul", text: "What time of day was this shot?", likes: 1, likedByMe: false },
  ]);

  // Check saved state
  useEffect(() => {
    if (!user || !id) return;
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

  if (!photo) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex flex-col items-center justify-center py-32 text-center">
          <h1 className="text-2xl font-bold">Shot not found</h1>
          <Link to="/" className="mt-4 text-sm text-muted-foreground hover:text-foreground">
            ← Back to gallery
          </Link>
        </div>
      </div>
    );
  }

  const gearBrand = photo.gear.split(" ")[0];
  const relatedPhotos = samplePhotos.filter(
    (p) => p.id !== photo.id && p.gear.includes(gearBrand)
  );

  const requireAuth = (message: string, action: () => void) => {
    if (!user) {
      setAuthDialogMessage(message);
      setShowAuthDialog(true);
      return;
    }
    action();
  };

  const handleLike = () => {
    requireAuth("You need to be logged in to like photos.", () => {
      setLiked(!liked);
    });
  };

  const handleSave = async () => {
    requireAuth("You need to be logged in to save photos.", async () => {
      if (!user) return;
      if (saved) {
        await supabase.from("saved_photos").delete().eq("user_id", user.id).eq("photo_id", id!);
        setSaved(false);
        toast.success("Removed from saved");
      } else {
        await supabase.from("saved_photos").insert({ user_id: user.id, photo_id: id! });
        setSaved(true);
        toast.success("Saved to collection");
      }
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: photo.caption || "Check out this shot", url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.image);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `visionx-${photo.id}.jpg`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Download started");
    } catch {
      toast.error("Failed to download");
    }
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, user: "you", text: commentText.trim(), isMine: true, likes: 0, likedByMe: false },
    ]);
    setCommentText("");
  };

  const toggleCommentLike = (commentId: string) => {
    requireAuth("You need to be logged in to like comments.", () => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, likedByMe: !c.likedByMe, likes: c.likes + (c.likedByMe ? -1 : 1) }
            : c
        )
      );
    });
  };

  const deleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    toast.success("Comment deleted");
  };

  const getVibeLabel = (tagId: string) => {
    const vibe = vibes.find((v) => v.id === tagId);
    return vibe ? `${vibe.emoji} ${vibe.label}` : tagId;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-6xl pt-24 pb-8">
        <BackButton />

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main image */}
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src={photo.image}
              alt={photo.caption || "Community photo"}
              className="w-full object-cover"
            />
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Uploader info */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="gradient-bg text-sm font-semibold text-primary-foreground">
                      {photo.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link to={`/${photo.username}`} className="font-semibold transition-colors hover:text-foreground">
                      @{photo.username}
                    </Link>
                    {photo.caption && (
                      <p className="mt-0.5 text-sm italic text-muted-foreground">{photo.caption}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant={isFollowing ? "secondary" : "default"}
                  size="sm"
                  onClick={() => requireAuth("You need to be logged in to follow users.", () => setIsFollowing(!isFollowing))}
                  className="gap-1.5"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
            </div>

            {/* Action buttons: Like, Share, Save, More */}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3">
              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
              >
                <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                <span className={liked ? "text-red-500" : "text-muted-foreground"}>Like</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
              >
                <Bookmark className={`h-5 w-5 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                <span className={saved ? "text-primary" : "text-muted-foreground"}>Save</span>
              </button>

              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleDownload} className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info("Report submitted")} className="gap-2 text-destructive focus:text-destructive">
                      <Flag className="h-4 w-4" />
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Tags */}
            {((photo.tags && photo.tags.length > 0) || photo.gear) && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {photo.gear && (
                    <Link
                      to={`/explore?q=${encodeURIComponent(photo.gear)}`}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                    >
                      <Camera className="h-3 w-3" /> {photo.gear}
                    </Link>
                  )}
                  {photo.tags?.map((tag) => (
                    <Link
                      key={tag}
                      to={`/vibe-matcher?vibe=${tag}`}
                      className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                    >
                      {getVibeLabel(tag)}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Gear details */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Gear & Settings
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <Camera className="h-4 w-4 text-muted-foreground" />
                <span>{photo.gear}</span>
              </div>
              {(photo.aperture || photo.iso) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {photo.aperture && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                      <Aperture className="h-3 w-3" />
                      {photo.aperture}
                    </span>
                  )}
                  {photo.iso && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                      <Gauge className="h-3 w-3" />
                      ISO {photo.iso}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Comments ({comments.length})
              </h3>
              <div className="mb-4 max-h-64 space-y-3 overflow-y-auto pr-1">
                {comments.map((c, i) => (
                  <div key={i} className="flex gap-2.5">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-secondary text-[10px] font-medium text-muted-foreground">
                        {c.user.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-xs font-medium">@{c.user}</span>
                      <p className="text-sm text-muted-foreground">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              {user ? (
                <div className="flex gap-2">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment…"
                    className="min-h-[40px] resize-none bg-secondary text-sm"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleComment();
                      }
                    }}
                  />
                  <Button size="icon" onClick={handleComment} disabled={!commentText.trim()} className="shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthDialogMessage("You need to be logged in to add comments.");
                    setShowAuthDialog(true);
                  }}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  Log in to add a comment…
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Related photos */}
        {relatedPhotos.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-1 text-lg font-bold">More shots with {gearBrand}</h2>
            <p className="mb-6 text-sm text-muted-foreground">Other community photos taken with similar gear</p>
            <div className="masonry-grid">
              {relatedPhotos.map((p) => (
                <PhotoCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>{authDialogMessage}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button onClick={() => navigate("/login")} className="w-full">Log In</Button>
            <Button variant="outline" onClick={() => navigate("/signup")} className="w-full">Sign Up</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoDetail;
