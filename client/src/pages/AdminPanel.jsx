import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import VerifiedBadge from "../components/VerifiedBadge";

const TABS = ["pending", "approved", "rejected", "all", "users", "reports", "verifications"];

const reasonLabel = {
  spam: "Spam or fake",
  wrong_info: "Incorrect info",
  scam: "Suspected scam",
  duplicate: "Duplicate",
  other: "Other",
};

const statusBadge = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminPanel() {
  const [tab, setTab] = useState("pending");
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStats = () =>
    api.get("/admin/stats").then((res) => setStats(res.data)).catch(console.error);

  const loadTab = async (name) => {
    setLoading(true);
    try {
      if (name === "users") {
        setUsers((await api.get("/admin/users")).data);
      } else if (name === "reports") {
        setReports((await api.get("/admin/reports", { params: { status: "open" } })).data);
      } else if (name === "verifications") {
        setVerifications(
          (await api.get("/admin/verifications", { params: { status: "pending" } })).data
        );
      } else {
        const status = name === "all" ? "" : name;
        setProperties((await api.get("/admin/properties", { params: { status } })).data);
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

  const run = async (request) => {
    try {
      await request();
      loadTab(tab);
      loadStats();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const setStatus = (id, status) =>
    run(() => api.put(`/admin/properties/${id}/status`, { status }));

  const toggleFeatured = (p) =>
    run(() => api.put(`/admin/properties/${p._id}/featured`, { featured: !p.featured }));

  const removeUser = (id) => {
    if (!window.confirm("Delete this user and all their listings?")) return;
    run(() => api.delete(`/admin/users/${id}`));
  };

  const toggleActive = (u) => {
    const active = u.isActive !== false;
    const verb = active ? "Suspend" : "Reactivate";
    if (!window.confirm(`${verb} ${u.name}?`)) return;
    run(() => api.put(`/admin/users/${u._id}/active`, { isActive: !active }));
  };

  const reviewReport = (id, status) =>
    run(() => api.put(`/admin/reports/${id}`, { status }));

  const rejectListingFromReport = (report) => {
    if (!report.property) return;
    if (!window.confirm("Reject this listing and resolve the report?")) return;
    run(async () => {
      await api.put(`/admin/properties/${report.property._id}/status`, { status: "rejected" });
      await api.put(`/admin/reports/${report._id}`, { status: "resolved" });
    });
  };

  const decideVerification = (id, status) =>
    run(() => api.put(`/admin/users/${id}/verification`, { status }));

  const tabClass = (name) =>
    `px-4 py-2 font-medium border-b-2 capitalize whitespace-nowrap ${
      tab === name
        ? "border-emerald-600 text-emerald-600"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`;

  const renderContent = () => {
    if (loading) return <p className="text-gray-500">Loading...</p>;

    if (tab === "users") {
      return (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Joined</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const active = u.isActive !== false;
                return (
                  <tr key={u._id} className="border-t">
                    <td className="p-3 font-medium">
                      {u.name}{" "}
                      {u.verificationStatus === "verified" && <VerifiedBadge />}
                    </td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3 capitalize">{u.role}</td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {active ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right space-x-3 whitespace-nowrap">
                      {u.role !== "admin" && (
                        <>
                          <button
                            onClick={() => toggleActive(u)}
                            className="text-amber-600 hover:underline"
                          >
                            {active ? "Suspend" : "Reactivate"}
                          </button>
                          <button
                            onClick={() => removeUser(u._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (tab === "reports") {
      return reports.length === 0 ? (
        <p className="text-gray-500">No open reports.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r._id} className="bg-white rounded-xl shadow p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  {r.property ? (
                    <Link
                      to={`/properties/${r.property._id}`}
                      className="font-semibold text-emerald-600"
                    >
                      {r.property.title}
                    </Link>
                  ) : (
                    <span className="font-semibold text-gray-500">Deleted property</span>
                  )}
                  <p className="text-sm text-gray-500">
                    Reported by {r.reporter?.name} ({r.reporter?.email}) ·{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs h-fit bg-red-50 text-red-600 px-2 py-1 rounded">
                  {reasonLabel[r.reason] || r.reason}
                </span>
              </div>

              {r.details && <p className="text-gray-700 mt-2 text-sm">{r.details}</p>}

              <div className="flex flex-wrap gap-2 mt-3">
                {r.property && (
                  <button
                    onClick={() => rejectListingFromReport(r)}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject listing
                  </button>
                )}
                <button
                  onClick={() => reviewReport(r._id, "resolved")}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Resolve
                </button>
                <button
                  onClick={() => reviewReport(r._id, "dismissed")}
                  className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (tab === "verifications") {
      return verifications.length === 0 ? (
        <p className="text-gray-500">No pending verification requests.</p>
      ) : (
        <div className="space-y-3">
          {verifications.map((u) => (
            <div key={u._id} className="bg-white rounded-xl shadow p-4">
              <p className="font-semibold text-gray-800">{u.name}</p>
              <p className="text-sm text-gray-500">
                ✉️ {u.email} {u.phone && `· 📞 ${u.phone}`}
              </p>
              <p className="text-sm mt-2">
                <span className="text-gray-500">License no:</span>{" "}
                <span className="font-medium">{u.licenseNo}</span>
              </p>
              {u.verificationNote && (
                <p className="text-sm text-gray-700 mt-1">{u.verificationNote}</p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => decideVerification(u._id, "verified")}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => decideVerification(u._id, "rejected")}
                  className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // property lists
    return properties.length === 0 ? (
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
              <div className="flex gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded capitalize ${statusBadge[p.status]}`}>
                  {p.status}
                </span>
                {p.featured && (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    ⭐ Featured
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0 justify-end">
              {p.status === "approved" && (
                <button
                  onClick={() => toggleFeatured(p)}
                  className="px-3 py-1.5 text-sm bg-amber-50 text-amber-700 rounded hover:bg-amber-100"
                >
                  {p.featured ? "Unfeature" : "⭐ Feature"}
                </button>
              )}
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
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin panel</h1>
        <Link
          to="/admin/analytics"
          className="bg-white border px-4 py-2 rounded font-semibold text-gray-700 hover:bg-gray-50"
        >
          📊 Analytics
        </Link>
      </div>

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
        {TABS.map((name) => (
          <button key={name} onClick={() => setTab(name)} className={tabClass(name)}>
            {name}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
}