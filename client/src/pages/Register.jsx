import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", role: "buyer",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const inputClass = "w-full px-3 py-2 border rounded";

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Create account</h1>
      {error && <p className="bg-red-50 text-red-600 p-2 rounded mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Full name" required value={form.name} onChange={handleChange} className={inputClass} />
        <input name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} className={inputClass} />
        <input name="password" type="password" placeholder="Password (min 6)" required minLength={6} value={form.password} onChange={handleChange} className={inputClass} />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className={inputClass} />

        <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
          <option value="buyer">I want to buy or rent</option>
          <option value="agent">I want to list properties (agent)</option>
        </select>

        <button className="w-full bg-emerald-600 text-white py-2 rounded font-semibold hover:bg-emerald-700">
          Sign up
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-4">
        Already registered? <Link to="/login" className="text-emerald-600 font-medium">Login</Link>
      </p>
    </div>
  );
}