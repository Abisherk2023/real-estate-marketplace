import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";

export default function PropertyCard({ property }) {
  const { _id, title, price, city, listingType, bedrooms, bathrooms, area, images } = property;

  const { user } = useAuth();
  const { ids, toggle } = useFavorites();
  const navigate = useNavigate();
  const isFav = ids.includes(_id);

  const handleHeart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate("/login");
    toggle(_id);
  };

  return (
    <Link
      to={`/properties/${_id}`}
      className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden block"
    >
      <div className="relative h-48 bg-gray-200">
        {images?.[0] ? (
          <img src={images[0].url} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded text-white ${
            listingType === "sale" ? "bg-emerald-600" : "bg-blue-600"
          }`}
        >
          For {listingType}
        </span>

        <button
          onClick={handleHeart}
          className="absolute top-3 right-3 bg-white/90 rounded-full w-9 h-9 flex items-center justify-center shadow hover:scale-110 transition"
          aria-label="Toggle favorite"
        >
          <span className={isFav ? "text-red-500" : "text-gray-400"}>
            {isFav ? "♥" : "♡"}
          </span>
        </button>
      </div>

      <div className="p-4">
        <p className="text-lg font-bold text-emerald-600">
          Rs. {price.toLocaleString()}
          {listingType === "rent" && <span className="text-sm text-gray-500"> /month</span>}
        </p>
        <h3 className="font-semibold text-gray-800 truncate">{title}</h3>
        <p className="text-sm text-gray-500 mb-3">📍 {city}</p>

        <div className="flex gap-4 text-sm text-gray-600 border-t pt-3">
          <span>🛏 {bedrooms} bed</span>
          <span>🛁 {bathrooms} bath</span>
          {area && <span>📐 {area} sqft</span>}
        </div>
      </div>
    </Link>
  );
}