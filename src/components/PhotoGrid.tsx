import PhotoCard from "./PhotoCard";
import { samplePhotos } from "@/data/samplePhotos";

const PhotoGrid = () => {
  return (
    <section className="container py-10">
      <div className="masonry-grid">
        {samplePhotos.map((photo) => (
          <PhotoCard key={photo.id} {...photo} />
        ))}
      </div>
    </section>
  );
};

export default PhotoGrid;
