import { useEffect, useState } from "react";
import api from "../api/axios";
import PropertyCard from "./PropertyCard";

export default function SimilarProperties({ propertyId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api
      .get(`/properties/${propertyId}/similar`)
      .then((res) => setItems(res.data))
      .catch(() => setItems([]));
  }, [propertyId]);

  if (items.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Similar properties</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <PropertyCard key={p._id} property={p} />
        ))}
      </div>
    </section>
  );
}