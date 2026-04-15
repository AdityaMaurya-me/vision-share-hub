import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PhotoGrid from "@/components/PhotoGrid";
import useScrollRestore from "@/hooks/useScrollRestore";

const Index = () => {
  useScrollRestore();

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
