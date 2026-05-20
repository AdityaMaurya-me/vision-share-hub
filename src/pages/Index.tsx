import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PhotoGrid from "@/components/PhotoGrid";
import Footer from "@/components/Footer";
import useScrollRestore from "@/hooks/useScrollRestore";

const Index = () => {
  useScrollRestore();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>VisionX — A creative community for photographers</title>
        <meta
          name="description"
          content="Discover photography, the gear behind every shot, and the people creating it. Share your vision on VisionX."
        />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="VisionX — A creative community for photographers" />
        <meta property="og:description" content="Discover photography, the gear behind every shot, and the people creating it." />
        <meta property="og:url" content="/" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <PhotoGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
