import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useCompare } from "../context/CompareContext";
import VerifiedBadge from "../components/VerifiedBadge";

const rows = [
  { label: "Price", get: (p) => p.price, format: (v) => `Rs. ${v.toLocaleString()}`, best: "min" },
  { label: "Listing", get: (p) => `For ${p.listingType}` },
  { label: "Type", get: (p) => p.propertyType, capitalize: true },
  { label: "City", get: (p) => p.city },
  { label: "Bedrooms", get: (p) => p.bedrooms, best: "max" },
  { label: "Bathrooms", get: (p) => p.bathrooms, best: "max" },
  { label: "Area (sqft)", get: (p) => p.area || null, best: "max" },
  {
    label: "Price per sqft",
    get: (p) => (p.area ? Math.round(p.price / p.area) : null),
    format: (v) => `Rs. ${v.toLocaleString()}`,
    best: "min",
  },
];

export default function Compare() {
  const { ids, remove, clear } = useCompare();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.allSettled(ids.map((id) => api.get(`/properties/${id}`)))
      .then((results) => {
        const loaded = [];
        results.forEach((r, i) => {
          if (r.status === "fulfilled" && r.value.data.status === "approved") {
            loaded.push(r.value.data);
          } else {
            remove(ids[i]); // deleted or no longer public
          }
        });
        setItems(loaded);
      })
      .finally(() => setLoading(false));
  }, [ids.join(",")]);

  if (loading) return <p className="text-center mt-12 text-gray-500">Loading...</p>;

  if (items.length === 0) {
    return (
      <div className="text-center mt-16 px-4">
        <p className="text-gray-600 mb-4">Nothing to compare yet.</p>
        <Link to="/properties" className="text-emerald-600 font-medium">
          Browse properties →
        </Link>
      </div>
    );
  }

  // Only highlight "best" values when comparing the same listing type
  const sameListing = items.every((p) => p.listingType === items[0].listingType);

  const bestOf = (row) => {
    if (!row.best || !sameListing) return null;
    const values = items.map(row.get).filter((v) => typeof v === "number");
    if (values.length < 2 || new Set(values).size < 2) return null;
    return row.best === "min" ? Math.min(...values) : Math.max(...values);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Compare properties</h1>
        <button onClick={clear} className="text-sm text-gray-500 hover:text-red-600">
          Clear all
        </button>
      </div>

      {!sameListing && (
        <p className="bg-yellow-50 text-yellow-700 p-3 rounded text-sm mb-4">
          You're comparing sale and rent listings, so best values are not highlighted.
        </p>
      )}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr>
              <th className="p-3 w-32"></th>
              {items.map((p) => (
                <th key={p._id} className="p-3 text-left align-top">
                  <div className="h-32 bg-gray-200 rounded-lg overflow-hidden mb-2">
                    {p.images?.[0] && (
                      <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <Link
                    to={`/properties/${p._id}`}
                    className="font-semibold text-gray-800 hover:text-emerald-600 block"
                  >
                    {p.title}
                  </Link>
                  <button
                    onClick={() => remove(p._id)}
                    className="text-xs text-red-600 hover:underline mt-1"
                  >
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const best = bestOf(row);
              return (
                <tr key={row.label} className="border-t">
                  <td className="p-3 font-medium text-gray-600">{row.label}</td>
                  {items.map((p) => {
                    const value = row.get(p);
                    const shown =
                      value === null || value === undefined
                        ? "-"
                        : row.format
                        ? row.format(value)
                        : value;
                    const isBest = best !== null && value === best;
                    return (
                      <td
                        key={p._id}
                        className={`p-3 ${row.capitalize ? "capitalize" : ""} ${
                          isBest ? "text-emerald-600 font-bold" : "text-gray-800"
                        }`}
                      >
                        {shown} {isBest && "✓"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr className="border-t">
              <td className="p-3 font-medium text-gray-600">Agent</td>
              {items.map((p) => (
                <td key={p._id} className="p-3 text-gray-800">
                  {p.agent?.name}{" "}
                  {p.agent?.verificationStatus === "verified" && <VerifiedBadge />}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}