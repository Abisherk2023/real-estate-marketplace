import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const reasons = [
  ["spam", "Spam or fake listing"],
  ["wrong_info", "Incorrect information"],
  ["scam", "Suspected scam"],
  ["duplicate", "Duplicate listing"],
  ["other", "Other"],
];

export default function ReportButton({ propertyId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [sending, setSending] = useState(false);

  const handleOpen = () => {
    if (!user) return navigate("/login");
    setMessage({ type: "", text: "" });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await api.post("/reports", { propertyId, reason, details });
      setMessage({ type: "success", text: data.message });
      setDetails("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Could not submit report",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-xs text-gray-400 hover:text-red-600 mt-3"
      >
        🚩 Report this listing
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={submit}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-3"
          >
            <h3 className="font-bold text-gray-800">Report this listing</h3>

            {message.text && (
              <p
                className={`p-2 rounded text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {message.text}
              </p>
            )}

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              {reasons.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <textarea
              rows={3}
              maxLength={500}
              placeholder="Add details (optional)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                Close
              </button>
              <button
                disabled={sending || message.type === "success"}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
              >
                {sending ? "Sending..." : "Submit report"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}