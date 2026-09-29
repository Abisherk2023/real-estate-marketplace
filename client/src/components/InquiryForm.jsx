import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function InquiryForm({ propertyId }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", text: "" });
  const [sending, setSending] = useState(false);

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-center">
        <p className="text-gray-600 mb-3">Login to contact the agent</p>
        <Link
          to="/login"
          className="bg-emerald-600 text-white px-5 py-2 rounded font-semibold hover:bg-emerald-700 inline-block"
        >
          Login
        </Link>
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus({ type: "", text: "" });
    try {
      await api.post("/inquiries", { ...form, propertyId });
      setStatus({ type: "success", text: "Message sent! The agent will contact you." });
      setForm({ ...form, message: "" });
    } catch (err) {
      setStatus({
        type: "error",
        text: err.response?.data?.message || "Could not send message",
      });
    } finally {
      setSending(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border rounded text-sm";

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-3">
      <h3 className="font-bold text-gray-800">Contact agent</h3>

      {status.text && (
        <p
          className={`p-2 rounded text-sm ${
            status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {status.text}
        </p>
      )}

      <input name="name" placeholder="Your name" required value={form.name} onChange={handleChange} className={inputClass} />
      <input name="email" type="email" placeholder="Your email" required value={form.email} onChange={handleChange} className={inputClass} />
      <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={handleChange} className={inputClass} />
      <textarea
        name="message"
        rows={4}
        required
        maxLength={1000}
        placeholder="I'm interested in this property..."
        value={form.message}
        onChange={handleChange}
        className={inputClass}
      />

      <button
        disabled={sending}
        className="w-full bg-emerald-600 text-white py-2 rounded font-semibold hover:bg-emerald-700 disabled:opacity-60"
      >
        {sending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}