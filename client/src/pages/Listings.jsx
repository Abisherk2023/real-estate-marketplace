import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import PropertyCard from "../components/PropertyCard";

const emptyFilters = {
  keyword: "", city: "", listingType: "", propertyType: "",
  minPrice: "", maxPrice: "", bedrooms: "", sort: "newest",
};

export default function Listings() {
  const [searchParams] = useSearchParams();

  // Start from URL params (coming from the home page search)
  const initial = {
    ...emptyFilters,
    city: searchParams.get("city") || "",
    listingType: searchParams.get("listingType") || "",
  };

  const [filters, setFilters] = useState(initial); // form values
  const [applied, setApplied] = useState(initial); // values used for fetching
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ properties: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = { page };
    Object.entries(applied).forEach(([key, value]) => {
      if (value !== "") params[key] = value;
    });

    setLoading(true);
    api
      .get("/properties", { params })
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [applied, page]);

  const handleChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    setApplied(filters);
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
  };

  const inputClass = "w-full px-3 py-2 border rounded text-sm";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid gap-8 lg:grid-cols-4">
      {/* Filters */}
      <form
        onSubmit={applyFilters}
        className="bg-white p-4 rounded-xl shadow space-y-3 h-fit lg:sticky lg:top-20"
      >
        <h2 className="font-bold text-gray-800">Filters</h2>

        <input name="keyword" placeholder="Keyword" value={filters.keyword} onChange={handleChange} className={inputClass} />
        <input name="city" placeholder="City" value={filters.city} onChange={handleChange} className={inputClass} />

        <select name="listingType" value={filters.listingType} onChange={handleChange} className={inputClass}>
          <option value="">Buy or Rent</option>
          <option value="sale">For sale</option>
          <option value="rent">For rent</option>
        </select>

        <select name="propertyType" value={filters.propertyType} onChange={handleChange} className={inputClass}>
          <option value="">All types</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="land">Land</option>
          <option value="commercial">Commercial</option>
        </select>

        <div className="flex gap-2">
          <input name="minPrice" type="number" placeholder="Min price" value={filters.minPrice} onChange={handleChange} className={inputClass} />
          <input name="maxPrice" type="number" placeholder="Max price" value={filters.maxPrice} onChange={handleChange} className={inputClass} />
        </div>

        <select name="bedrooms" value={filters.bedrooms} onChange={handleChange} className={inputClass}>
          <option value="">Any bedrooms</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>

        <select name="sort" value={filters.sort} onChange={handleChange} className={inputClass}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="priceLow">Price: low to high</option>
          <option value="priceHigh">Price: high to low</option>
        </select>

        <button className="w-full bg-emerald-600 text-white py-2 rounded font-semibold hover:bg-emerald-700">
          Apply
        </button>
        <button type="button" onClick={resetFilters} className="w-full bg-gray-100 py-2 rounded text-sm hover:bg-gray-200">
          Reset
        </button>
      </form>

      {/* Results */}
      <div className="lg:col-span-3">
        <p className="text-gray-600 mb-4">{data.total} properties found</p>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : data.properties.length === 0 ? (
          <p className="text-gray-500">No properties match your filters.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {data.properties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data.pages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-white border rounded disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {data.pages}
            </span>
            <button
              disabled={page === data.pages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-white border rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}