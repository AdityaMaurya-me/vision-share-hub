import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { Link } from "react-router-dom";
import { ChevronRight, User, Bell, Shield, Palette } from "lucide-react";

const items = [
  { icon: User, label: "Account", desc: "Edit your profile and avatar", to: "/edit-profile" },
  { icon: Bell, label: "Notifications", desc: "Manage how we reach you", to: "#" },
  { icon: Shield, label: "Privacy", desc: "Control who sees your activity", to: "#" },
  { icon: Palette, label: "Appearance", desc: "Theme and display preferences", to: "#" },
];

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-2xl pt-24 pb-16">
        <BackButton />
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your account and app preferences.</p>

        <div className="mt-8 divide-y divide-border rounded-xl border border-border bg-card">
          {items.map(({ icon: Icon, label, desc, to }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Settings;
