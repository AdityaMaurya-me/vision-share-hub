import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <span className="gradient-text text-xl font-bold tracking-tight">
          VisionX
        </span>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            to="/vibe-matcher"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Vibe Matcher
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Log In
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="gradient-bg border-0 text-primary-foreground hover:opacity-90">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
