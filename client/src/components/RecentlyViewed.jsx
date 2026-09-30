import { useEffect, useState } from "react";
import api from "../api/axios";
import PropertyCard from "./PropertyCard";

export default function RecentlyViewed() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let ids = [];
    try {
      ids = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    } catch (e) {
      ids = [];
    }
    if (ids.length === 0) return;

    Promise.allSettled(ids.slice(0, 3).map((id) => api.get(`/properties/${id}`))).then(
      (results) => {
        setItems(
          results
            .filter((r) => r.status === "fulfilled" && r.value.data.status === "approved")
            .map((r) => r.value.data)
        );
      }
    );
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 pt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Recently viewed</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <PropertyCard key={p._id} property={p} />
        ))}
      </div>
    </section>
  );
}