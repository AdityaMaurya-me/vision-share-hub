import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { samplePhotos } from "@/data/samplePhotos";
import PhotoCard from "@/components/PhotoCard";

interface Profile {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface UploadedPhoto {
  id: string;
  image_url: string;
  caption: string | null;
  gear_name: string | null;
  aperture: string | null;
  iso: string | null;
}

interface Collection {
  id: string;
  name: string;
  photoIds: string[];
}

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploads, setUploads] = useState<UploadedPhoto[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Sample photos uploaded by this username (for the demo data)
  const sampleUploads = samplePhotos.filter((p) => p.username === username);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    (async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url, bio")
        .eq("username", username)
        .maybeSingle();

      if (!prof) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setProfile(prof);

      const { data: ph } = await supabase
        .from("photos")
        .select("id, image_url, caption, gear_name, aperture, iso")
        .eq("user_id", prof.user_id)
        .order("created_at", { ascending: false });
      if (ph) setUploads(ph);

      const { data: cols } = await supabase
        .from("collections")
        .select("id, name")
        .eq("user_id", prof.user_id)
        .order("created_at", { ascending: false });

      if (cols && cols.length) {
        const { data: cps } = await supabase
          .from("collection_photos")
          .select("collection_id, photo_id")
          .eq("user_id", prof.user_id);
        const byCol: Record<string, string[]> = {};
        cps?.forEach((c) => {
          (byCol[c.collection_id] ||= []).push(c.photo_id);
        });
        setCollections(cols.map((c) => ({ ...c, photoIds: byCol[c.id] || [] })));
      }
      setLoading(false);
    })();
  }, [username]);

  const initials = (profile?.username || username || "?").slice(0, 2).toUpperCase();
  const totalUploads = uploads.length + sampleUploads.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!profile && sampleUploads.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24">
          <BackButton />
          <div className="py-16 text-center">
            <h1 className="text-2xl font-bold">User not found</h1>
            <p className="mt-2 text-muted-foreground">No user named @{username} exists.</p>
            <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">← Back to gallery</Link>
          </div>
        </div>
      </div>
    );
  }

  const activeCol = collections.find((c) => c.id === activeCollection);
  const collectionPhotos = activeCol
    ? samplePhotos.filter((p) => activeCol.photoIds.includes(p.id))
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-16">
        <BackButton />

        <div className="mb-8 flex items-start gap-6">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary text-xl text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-2xl font-bold">@{profile?.username || username}</h1>
            {profile?.bio && (
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">{profile.bio}</p>
            )}
            <div className="mt-4 flex gap-8">
              <div>
                <p className="text-xl font-bold">{totalUploads}</p>
                <p className="text-sm text-muted-foreground">Uploads</p>
              </div>
              <div>
                <p className="text-xl font-bold">{collections.length}</p>
                <p className="text-sm text-muted-foreground">Collections</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="uploads" className="w-full">
          <TabsList className="bg-secondary">
            <TabsTrigger value="uploads">Uploads</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
          </TabsList>

          <TabsContent value="uploads" className="mt-4">
            {totalUploads === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <p className="text-lg font-medium">No uploads yet</p>
              </div>
            ) : (
              <div className="masonry-grid">
                {uploads.map((p) => (
                  <div key={p.id} className="masonry-item overflow-hidden rounded-xl border border-border bg-card">
                    <Link to={`/photo/${p.id}`}>
                      <img src={p.image_url} alt={p.caption || "Upload"} className="w-full" />
                    </Link>
                    <div className="p-3">
                      {p.caption && <p className="text-sm italic text-muted-foreground">{p.caption}</p>}
                      {p.gear_name && <p className="text-xs text-text-hint">{p.gear_name}</p>}
                    </div>
                  </div>
                ))}
                {sampleUploads.map((p) => (
                  <PhotoCard key={p.id} {...p} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="collections" className="mt-4">
            {collections.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <p className="text-lg font-medium">No collections yet</p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-wrap gap-2">
                  {collections.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCollection(activeCollection === c.id ? null : c.id)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                        activeCollection === c.id
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-secondary text-muted-foreground hover:border-surface-hover"
                      }`}
                    >
                      <Folder className="h-4 w-4" />
                      {c.name} ({c.photoIds.length})
                    </button>
                  ))}
                </div>

                {activeCol && (
                  collectionPhotos.length > 0 ? (
                    <div className="masonry-grid">
                      {collectionPhotos.map((p) => (
                        <PhotoCard key={p.id} {...p} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">This collection is empty.</p>
                  )
                )}
                {!activeCol && (
                  <p className="text-center text-sm text-muted-foreground">Select a collection to view its photos.</p>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserProfile;
