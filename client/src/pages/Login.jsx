import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      {error && <p className="bg-red-50 text-red-600 p-2 rounded mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email" placeholder="Email" required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="password" placeholder="Password" required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
        <button className="w-full bg-emerald-600 text-white py-2 rounded font-semibold hover:bg-emerald-700">
          Login
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-4">
        No account? <Link to="/register" className="text-emerald-600 font-medium">Sign up</Link>
      </p>
    </div>
  );
}