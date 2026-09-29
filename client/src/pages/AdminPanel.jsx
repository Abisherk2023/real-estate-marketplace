import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function AdminPanel() {
  const [tab, setTab] = useState("pending");
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStats = () =>
    api.get("/admin/stats").then((res) => setStats(res.data)).catch(console.error);

  const loadTab = async (name) => {
    setLoading(true);
    try {
      if (name === "users") {
        const { data } = await api.get("/admin/users");
        setUsers(data);
      } else {
        const status = name === "all" ? "" : name;
        const { data } = await api.get("/admin/properties", { params: { status } });
        setProperties(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadTab(tab);
  }, [tab]);

  const setStatus = async (id, status) => {
    try {
      await api.put(`/admin/properties/${id}/status`, { status });
      loadTab(tab);
      loadStats();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm("Delete this user and all their listings?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      loadTab("users");
      loadStats();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const tabClass = (name) =>
    `px-4 py-2 font-medium border-b-2 capitalize ${
      tab === name
        ? "border-emerald-600 text-emerald-600"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`;

  const statusBadge = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin panel</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            ["Users", stats.users],
            ["Properties", stats.properties],
            ["Pending", stats.pending],
            ["Inquiries", stats.inquiries],
          ].map(([label, value]) => (
            <div key={label} className="bg-white p-4 rounded-xl shadow">
              <p className="text-2xl font-bold text-emerald-600">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="border-b mb-6 flex gap-2 overflow-x-auto">
        {["pending", "approved", "rejected", "all", "users"].map((name) => (
          <button key={name} onClick={() => setTab(name)} className={tabClass(name)}>
            {name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : tab === "users" ? (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    {u.role !== "admin" && (
                      <button
                        onClick={() => removeUser(u._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : properties.length === 0 ? (
        <p className="text-gray-500">No properties in this list.</p>
      ) : (
        <div className="space-y-3">
          {properties.map((p) => (
            <div key={p._id} className="bg-white rounded-xl shadow p-3 flex items-center gap-4">
              <div className="h-20 w-28 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                {p.images?.[0] && (
                  <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
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
                  {p.city} · Rs. {p.price.toLocaleString()} · by {p.agent?.name}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded capitalize ${statusBadge[p.status]}`}
                >
                  {p.status}
                </span>
              </div>

              <div className="flex gap-2 shrink-0">
                {p.status !== "approved" && (
                  <button
                    onClick={() => setStatus(p._id, "approved")}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                )}
                {p.status !== "rejected" && (
                  <button
                    onClick={() => setStatus(p._id, "rejected")}
                    className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}