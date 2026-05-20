import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import GoogleButton from "@/components/GoogleButton";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password, username);
      toast.success("Account created! Check your email to verify.");
      navigate("/profile");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Sign up — VisionX</title>
        <meta name="description" content="Join VisionX to share your photography, build a kit and discover gear from real shooters." />
        <link rel="canonical" href="/signup" />
      </Helmet>
      <Navbar />
      <main className="flex items-center justify-center pt-32 px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
          <h1 className="text-2xl font-bold">Sign Up</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join the VisionX community</p>

          <div className="mt-6 space-y-3">
            <GoogleButton label="Sign up with Google" />
            <div className="relative my-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="bg-card px-2 relative z-10">or</span>
              <div className="absolute left-0 right-0 top-1/2 h-px bg-border -z-0" />
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-secondary border-border" />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border" />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary border-border" />
            <Button type="submit" disabled={loading} className="w-full gradient-bg border-0 text-primary-foreground">
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            By signing up you agree to our{" "}
            <Link to="/terms" className="hover:text-foreground underline">Terms</Link> and{" "}
            <Link to="/privacy" className="hover:text-foreground underline">Privacy Policy</Link>.
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Log In</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup;
