import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative flex h-[400px] items-center justify-center overflow-hidden">
      <img
        src={heroBg}
        alt="Photographer silhouette at twilight"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={800}
      />
      <div className="absolute inset-0 bg-background/70" />
      <div className="relative z-10 text-center px-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          See what your camera is
          <br />
          <span className="gradient-text">truly capable of.</span>
        </h1>
        <p className="mt-4 max-w-lg mx-auto text-sm text-text-secondary sm:text-base">
          A creative community for photographers and filmmakers to share their
          vision, discover gear, and inspire each other.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
