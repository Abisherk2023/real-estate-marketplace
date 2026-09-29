import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const statusStyle = {
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
};

export default function Dashboard() {
  const [tab, setTab] = useState("properties");
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [p, i] = await Promise.all([
        api.get("/properties/mine"),
        api.get("/inquiries/received"),
      ]);
      setProperties(p.data);
      setInquiries(i.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this property? This cannot be undone.")) return;
    try {
      await api.delete(`/properties/${id}`);
      setProperties(properties.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/inquiries/${id}/read`);
      setInquiries(inquiries.map((q) => (q._id === id ? { ...q, isRead: true } : q)));
    } catch (err) {
      console.error(err);
    }
  };

  const unread = inquiries.filter((q) => !q.isRead).length;

  const tabClass = (name) =>
    `px-4 py-2 font-medium border-b-2 ${
      tab === name
        ? "border-emerald-600 text-emerald-600"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`;

  if (loading) return <p className="text-center mt-12 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Agent dashboard</h1>
        <Link
          to="/dashboard/properties/new"
          className="bg-emerald-600 text-white px-4 py-2 rounded font-semibold hover:bg-emerald-700"
        >
          + Add property
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-2xl font-bold text-emerald-600">{properties.length}</p>
          <p className="text-sm text-gray-500">My properties</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-2xl font-bold text-blue-600">{unread}</p>
          <p className="text-sm text-gray-500">Unread inquiries</p>
        </div>
      </div>

      <div className="border-b mb-6 flex gap-2">
        <button onClick={() => setTab("properties")} className={tabClass("properties")}>
          My properties
        </button>
        <button onClick={() => setTab("inquiries")} className={tabClass("inquiries")}>
          Inquiries {unread > 0 && `(${unread})`}
        </button>
      </div>

      {/* My properties */}
      {tab === "properties" &&
        (properties.length === 0 ? (
          <p className="text-gray-500">You haven't listed any properties yet.</p>
        ) : (
          <div className="space-y-3">
            {properties.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-xl shadow p-3 flex items-center gap-4"
              >
                <div className="h-20 w-28 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                  {p.images?.[0] && (
                    <img
                      src={p.images[0].url}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/properties/${p._id}`}
                    className="font-semibold text-gray-800 hover:text-emerald-600 truncate block"
                  >
                    {p.title}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {p.city} · For {p.listingType} · Rs. {p.price.toLocaleString()}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded capitalize ${
                      statusStyle[p.status] || statusStyle.pending
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Link
                    to={`/dashboard/properties/${p._id}/edit`}
                    className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* Inquiries */}
      {tab === "inquiries" &&
        (inquiries.length === 0 ? (
          <p className="text-gray-500">No inquiries yet.</p>
        ) : (
          <div className="space-y-3">
            {inquiries.map((q) => (
              <div
                key={q._id}
                className={`bg-white rounded-xl shadow p-4 border-l-4 ${
                  q.isRead ? "border-gray-200" : "border-emerald-500"
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">{q.name}</p>
                    <p className="text-sm text-gray-500">
                      ✉️ {q.email} {q.phone && `· 📞 ${q.phone}`}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <p className="text-sm text-gray-500 mt-1">
                  About:{" "}
                  {q.property ? (
                    <Link to={`/properties/${q.property._id}`} className="text-emerald-600">
                      {q.property.title}
                    </Link>
                  ) : (
                    "Deleted property"
                  )}
                </p>

                <p className="text-gray-700 mt-2">{q.message}</p>

                {!q.isRead && (
                  <button
                    onClick={() => markRead(q._id)}
                    className="mt-3 text-sm text-emerald-600 font-medium"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}