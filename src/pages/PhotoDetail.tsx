import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import PhotoCard from "@/components/PhotoCard";
import { samplePhotos } from "@/data/samplePhotos";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, UserPlus, Send, Camera, Aperture, Gauge } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PhotoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const photo = samplePhotos.find((p) => p.id === id);
  const [commentText, setCommentText] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [comments, setComments] = useState<{ user: string; text: string }[]>([
    { user: "pixel_hunter", text: "Incredible composition! The light is perfect." },
    { user: "analog_soul", text: "What time of day was this shot?" },
  ]);

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

  // Find related photos shot with similar gear (same brand keyword)
  const gearBrand = photo.gear.split(" ")[0];
  const relatedPhotos = samplePhotos.filter(
    (p) => p.id !== photo.id && p.gear.includes(gearBrand)
  );

  const handleComment = () => {
    if (!commentText.trim()) return;
    setComments((prev) => [...prev, { user: "you", text: commentText.trim() }]);
    setCommentText("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-6xl py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main image */}
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src={photo.image}
              alt={photo.caption || "Community photo"}
              className="w-full object-cover"
            />
          </div>

          {/* Sidebar info */}
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
                    <Link
                      to={`/${photo.username}`}
                      className="font-semibold transition-colors hover:text-foreground"
                    >
                      @{photo.username}
                    </Link>
                    {photo.caption && (
                      <p className="mt-0.5 text-sm italic text-muted-foreground">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant={isFollowing ? "secondary" : "default"}
                  size="sm"
                  onClick={() => setIsFollowing(!isFollowing)}
                  className="gap-1.5"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
            </div>

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
                <Button
                  size="icon"
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related photos */}
        {relatedPhotos.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-1 text-lg font-bold">
              More shots with {gearBrand}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Other community photos taken with similar gear
            </p>
            <div className="masonry-grid">
              {relatedPhotos.map((p) => (
                <PhotoCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default PhotoDetail;
