import { useState } from "react";

export default function ImageGallery({ images = [], title }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">
        No images available
      </div>
    );
  }

  return (
    <div>
      <div className="h-96 bg-gray-200 rounded-xl overflow-hidden">
        <img
          src={images[active].url}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 mt-3 overflow-x-auto">
          {images.map((img, i) => (
            <img
              key={img.public_id || i}
              src={img.url}
              alt={`${title} ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-20 w-28 object-cover rounded-lg cursor-pointer border-2 ${
                i === active ? "border-emerald-600" : "border-transparent opacity-70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}