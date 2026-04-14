import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import PhotoCard from "@/components/PhotoCard";
import { samplePhotos } from "@/data/samplePhotos";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ username: string; avatar_url: string | null; bio: string | null } | null>(null);
  const [editing, setEditing] = useState(false);
  const [savedPhotoIds, setSavedPhotoIds] = useState<string[]>([]);

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
  }, [user]);

  const savedPhotos = samplePhotos.filter((p) => savedPhotoIds.includes(p.id));

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied!");
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
                  <p className="text-xl font-bold">0</p>
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
              onClick={() => setEditing(!editing)}
            >
              Edit Profile
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
            <Button size="sm" className="gradient-bg border-0 text-primary-foreground">
              Upload
            </Button>
          </div>

          <TabsContent value="uploads">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Empty state – user hasn't uploaded yet */}
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
                <p className="text-lg font-medium">No uploads yet</p>
                <p className="text-sm">Share your first photo with the community!</p>
              </div>
            </div>
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
