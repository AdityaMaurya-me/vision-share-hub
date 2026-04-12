import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface PhotoCardProps {
  image: string;
  caption?: string;
  username: string;
  gear: string;
  aperture?: string;
  iso?: string;
}

const PhotoCard = ({ image, caption, username, gear, aperture, iso }: PhotoCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="masonry-item group relative overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-surface-hover"
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      {showMenu && (
        <button className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/60 text-foreground opacity-0 transition-opacity group-hover:opacity-100">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )}

      <img
        src={image}
        alt={caption || "Community photo"}
        className="w-full object-cover"
        loading="lazy"
      />

      <div className="p-3">
        {caption && (
          <p className="text-sm italic text-text-secondary">{caption}</p>
        )}
        <Link
          to={`/${username}`}
          className="mt-1 block text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          @{username}
        </Link>
        <p className="text-xs text-text-hint">{gear}</p>

        {(aperture || iso) && (
          <div className="mt-2 flex gap-2">
            {aperture && (
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {aperture}
              </span>
            )}
            {iso && (
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                ISO {iso}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoCard;
