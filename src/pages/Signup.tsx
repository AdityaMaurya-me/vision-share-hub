import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";

const Signup = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex items-center justify-center pt-32 px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
          <h1 className="text-2xl font-bold">Sign Up</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join the VisionX community</p>
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Input type="text" placeholder="Username" className="bg-secondary border-border" />
            <Input type="email" placeholder="Email" className="bg-secondary border-border" />
            <Input type="password" placeholder="Password" className="bg-secondary border-border" />
            <Button type="submit" className="w-full gradient-bg border-0 text-primary-foreground">
              Create Account
            </Button>
          </form>
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
