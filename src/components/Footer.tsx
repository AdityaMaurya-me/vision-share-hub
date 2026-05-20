import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-background/60 mt-16">
    <div className="container flex flex-col items-center justify-between gap-4 py-8 text-xs text-muted-foreground sm:flex-row">
      <p>© {new Date().getFullYear()} VisionX. Built by photographers, for photographers.</p>
      <nav className="flex flex-wrap items-center gap-5">
        <Link to="/explore" className="hover:text-foreground">Explore</Link>
        <Link to="/gears" className="hover:text-foreground">Gears</Link>
        <Link to="/help" className="hover:text-foreground">Help</Link>
        <Link to="/terms" className="hover:text-foreground">Terms</Link>
        <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
      </nav>
    </div>
  </footer>
);

export default Footer;
