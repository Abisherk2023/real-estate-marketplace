import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center mt-24 px-4">
      <p className="text-6xl font-bold text-emerald-600">404</p>
      <p className="text-gray-600 mt-2 mb-6">This page doesn't exist.</p>
      <Link
        to="/"
        className="bg-emerald-600 text-white px-5 py-2 rounded font-semibold hover:bg-emerald-700"
      >
        Go home
      </Link>
    </div>
  );
}