import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PhotoGrid from "@/components/PhotoGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <PhotoGrid />
      </main>
    </div>
  );
};

export default Index;
