import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
}

/**
 * Renders an image inside a frame whose aspect-ratio is reserved
 * BEFORE the image is decoded, so the layout doesn't jump while loading.
 */
const FramedImage = ({ src, alt, className = "", imgClassName = "" }: Props) => {
  const [ratio, setRatio] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoaded(false);
    setRatio(null);
    const probe = new Image();
    probe.src = src;
    if (probe.complete && probe.naturalWidth) {
      setRatio(probe.naturalWidth / probe.naturalHeight);
    } else {
      probe.onload = () => setRatio(probe.naturalWidth / probe.naturalHeight);
    }
  }, [src]);

  return (
    <div
      className={`relative w-full overflow-hidden bg-secondary/40 ${className}`}
      style={{ aspectRatio: ratio ?? 4 / 5 }}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-secondary/60 to-secondary/30" />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={(e) => {
          const t = e.currentTarget;
          if (t.naturalWidth) setRatio(t.naturalWidth / t.naturalHeight);
          setLoaded(true);
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${imgClassName}`}
      />
    </div>
  );
};

export default FramedImage;
