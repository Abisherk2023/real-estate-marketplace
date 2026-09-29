import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import PropertyCard from "../components/PropertyCard";

export default function Home() {
  const [latest, setLatest] = useState([]);
  const [city, setCity] = useState("");
  const [listingType, setListingType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/properties", { params: { limit: 6 } })
      .then((res) => setLatest(res.data.properties))
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (listingType) params.set("listingType", listingType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find your dream home</h1>
          <p className="mb-8 text-emerald-50">Buy, sell or rent properties across Sri Lanka</p>

          <form
            onSubmit={handleSearch}
            className="bg-white rounded-xl p-3 flex flex-col md:flex-row gap-3 shadow-lg"
          >
            <input
              type="text"
              placeholder="City (e.g. Colombo)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1 px-3 py-2 rounded border text-gray-800"
            />
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              className="px-3 py-2 rounded border text-gray-800"
            >
              <option value="">Buy or Rent</option>
              <option value="sale">Buy</option>
              <option value="rent">Rent</option>
            </select>
            <button className="bg-emerald-600 text-white px-6 py-2 rounded font-semibold hover:bg-emerald-700">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Latest */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Latest properties</h2>
        {latest.length === 0 ? (
          <p className="text-gray-500">No properties yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}