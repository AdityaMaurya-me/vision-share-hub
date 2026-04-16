import { useState, useEffect } from "react";
import useScrollRestore from "@/hooks/useScrollRestore";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import PhotoCard from "@/components/PhotoCard";
import { samplePhotos } from "@/data/samplePhotos";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UploadedPhoto {
  id: string;
  image_url: string;
  caption: string | null;
  gear_name: string | null;
  aperture: string | null;
  iso: string | null;
  created_at: string;
}

const Profile = () => {
  useScrollRestore();
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ username: string; avatar_url: string | null; bio: string | null } | null>(null);
  const [savedPhotoIds, setSavedPhotoIds] = useState<string[]>([]);
  const [uploads, setUploads] = useState<UploadedPhoto[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("username, avatar_url, bio")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });

    supabase
      .from("saved_photos")
      .select("photo_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setSavedPhotoIds(data.map((d) => d.photo_id));
      });

    supabase
      .from("photos")
      .select("id, image_url, caption, gear_name, aperture, iso, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setUploads(data);
      });
  }, [user]);

  const savedPhotos = samplePhotos.filter((p) => savedPhotoIds.includes(p.id));

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied!");
  };

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDeleteUpload = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("photos").delete().eq("id", deleteTarget);
    if (error) {
      toast.error("Failed to delete");
    } else {
      setUploads((prev) => prev.filter((p) => p.id !== deleteTarget));
      toast.success("Photo deleted");
    }
    setDeleteTarget(null);
  };

  const username = profile?.username || user?.email || "User";
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-16">
        {/* Profile Header */}
        <div className="flex items-start gap-6 mb-8">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold">{username}</h1>
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-xl font-bold">{uploads.length}</p>
                  <p className="text-sm text-muted-foreground">Uploaded</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{savedPhotoIds.length}</p>
                  <p className="text-sm text-muted-foreground">Saved</p>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              className="mt-2 gradient-bg border-0 text-primary-foreground"
              asChild
            >
              <Link to="/edit-profile">Edit Profile</Link>
            </Button>
            <button
              onClick={handleShare}
              className="mt-2 ml-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Share2 className="h-4 w-4" /> Share Profile
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="uploads" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-secondary">
              <TabsTrigger value="uploads">My Uploads</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
              <TabsTrigger value="kit">My Kit</TabsTrigger>
            </TabsList>
            <Button size="sm" className="gradient-bg border-0 text-primary-foreground" asChild>
              <Link to="/upload">Upload</Link>
            </Button>
          </div>

          <TabsContent value="uploads">
            {uploads.length > 0 ? (
              <div className="masonry-grid">
                {uploads.map((photo) => (
                  <div key={photo.id} className="break-inside-avoid mb-4 group relative rounded-xl overflow-hidden border border-border bg-secondary">
                    <img src={photo.image_url} alt={photo.caption || "Upload"} className="w-full" />
                    <div className="p-3 space-y-1">
                      {photo.caption && <p className="text-sm italic text-muted-foreground">{photo.caption}</p>}
                      {photo.gear_name && <p className="text-xs text-muted-foreground">{photo.gear_name}</p>}
                      <div className="flex gap-2">
                        {photo.aperture && <span className="text-[10px] px-1.5 py-0.5 rounded bg-background text-muted-foreground">{photo.aperture}</span>}
                        {photo.iso && <span className="text-[10px] px-1.5 py-0.5 rounded bg-background text-muted-foreground">ISO {photo.iso}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteUpload(photo.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground rounded-full p-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <p className="text-lg font-medium">No uploads yet</p>
                <p className="text-sm">Share your first photo with the community!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved">
            {savedPhotos.length > 0 ? (
              <div className="masonry-grid">
                {savedPhotos.map((photo) => (
                  <PhotoCard key={photo.id} {...photo} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <p className="text-lg font-medium">No saved photos</p>
                <p className="text-sm">Bookmark photos from the gallery to see them here!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="kit">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
                <p className="text-lg font-medium">No gear in your kit</p>
                <p className="text-sm">Save gear from photos you love!</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
