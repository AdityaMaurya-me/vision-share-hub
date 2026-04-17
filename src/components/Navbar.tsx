import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, Settings, HelpCircle, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Navbar = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <span className="gradient-text text-xl font-bold tracking-tight">
          VisionX
        </span>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Home
          </Link>
          <Link to="/explore" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Explore
          </Link>
          <Link to="/vibe-matcher" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Vibe Matcher
          </Link>
          {user && (
            <Link to="/profile" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              My Profile
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full focus:outline-none">
                  <Avatar className="h-8 w-8 border border-primary">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {(user.email || "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/help" className="gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Help
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
