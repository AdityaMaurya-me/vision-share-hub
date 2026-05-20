import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase places a recovery token in the URL hash and triggers a PASSWORD_RECOVERY event.
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    // Also handle direct loads when a session is already established
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Use at least 8 characters");
    if (password !== confirm) return toast.error("Passwords don't match");
    setLoading(true);
    try {
      await updatePassword(password);
      toast.success("Password updated");
      navigate("/profile");
    } catch (err: any) {
      toast.error(err.message || "Could not update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Set a new password — VisionX</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />
      <main className="flex items-center justify-center pt-32 px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ready ? "Pick something memorable but strong." : "Verifying your reset link…"}
          </p>

          <form className="mt-6 space-y-4" onSubmit={handle}>
            <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary border-border" />
            <Input type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="bg-secondary border-border" />
            <Button type="submit" disabled={loading || !ready} className="w-full gradient-bg border-0 text-primary-foreground">
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">Back to log in</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
