import { useEffect, useState } from "react";
import api from "../api/axios";
import PropertyCard from "../components/PropertyCard";
import { useFavorites } from "../context/FavoritesContext";

export default function Favorites() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ids } = useFavorites();

  useEffect(() => {
    api
      .get("/favorites")
      .then((res) => setProperties(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Hide a card right after it's un-hearted
  const visible = properties.filter((p) => ids.includes(p._id));

  if (loading) return <p className="text-center mt-12 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Saved properties</h1>

      {visible.length === 0 ? (
        <p className="text-gray-500">You haven't saved any properties yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <PropertyCard key={p._id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}