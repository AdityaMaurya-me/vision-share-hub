import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";

const Login = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex items-center justify-center pt-32 px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
          <h1 className="text-2xl font-bold">Log In</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back to VisionX</p>
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Input type="email" placeholder="Email" className="bg-secondary border-border" />
            <Input type="password" placeholder="Password" className="bg-secondary border-border" />
            <Button type="submit" className="w-full gradient-bg border-0 text-primary-foreground">
              Log In
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">Sign Up</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
