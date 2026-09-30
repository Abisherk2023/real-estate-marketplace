import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import VerifiedBadge from "../components/VerifiedBadge";

export default function VerificationRequest() {
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({ licenseNo: "", note: "" });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const load = () =>
    api
      .get("/auth/me")
      .then((res) => setMe(res.data))
      .catch(() => setError("Could not load your profile"));

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await api.post("/verification/request", form);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not send request");
    } finally {
      setSending(false);
    }
  };

  if (!me) return <p className="text-center mt-12 text-gray-500">Loading...</p>;

  const status = me.verificationStatus || "none";
  const inputClass = "w-full px-3 py-2 border rounded text-sm";

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link to="/dashboard" className="text-sm text-emerald-600 font-medium">
        ← Back to dashboard
      </Link>

      <div className="bg-white p-6 rounded-xl shadow mt-4 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">Agent verification</h1>
        <p className="text-sm text-gray-500">
          Verified agents get a badge on their listings, which builds trust with buyers.
        </p>

        {error && <p className="bg-red-50 text-red-600 p-2 rounded text-sm">{error}</p>}

        {status === "verified" && (
          <div className="bg-green-50 p-4 rounded-lg">
            <VerifiedBadge />
            <p className="text-sm text-green-700 mt-2">Your account is verified.</p>
          </div>
        )}

        {status === "pending" && (
          <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-700">
            Your request is being reviewed by the admin.
          </div>
        )}

        {(status === "none" || status === "rejected") && (
          <>
            {status === "rejected" && (
              <p className="bg-red-50 text-red-600 p-2 rounded text-sm">
                Your last request was rejected. You can submit it again with correct details.
              </p>
            )}
            <form onSubmit={submit} className="space-y-3">
              <input
                required
                placeholder="License or business registration number"
                value={form.licenseNo}
                onChange={(e) => setForm({ ...form, licenseNo: e.target.value })}
                className={inputClass}
              />
              <textarea
                rows={3}
                maxLength={500}
                placeholder="Anything else the admin should know (company, experience)"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className={inputClass}
              />
              <button
                disabled={sending}
                className="w-full bg-emerald-600 text-white py-2 rounded font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                {sending ? "Sending..." : "Request verification"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}