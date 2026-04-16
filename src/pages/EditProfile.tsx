import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Camera } from "lucide-react";

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("username, bio, avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setUsername(data.username || "");
          setBio(data.bio || "");
          setAvatarUrl(data.avatar_url);
        }
      });
  }, [user]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      let newAvatarUrl = avatarUrl;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("photos")
          .upload(path, avatarFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);
        newAvatarUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ username, bio, avatar_url: newAvatarUrl })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Profile updated");
      navigate("/profile");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const displayAvatar = avatarPreview || avatarUrl;
  const initials = (username || user?.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-lg pt-24 pb-16">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="mb-8 text-2xl font-bold">Edit Profile</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={displayAvatar || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-foreground" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm text-primary hover:underline"
            >
              Change photo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself..."
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="gradient-bg border-0 text-primary-foreground">
              {saving ? "Saving…" : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/profile")}>
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditProfile;
