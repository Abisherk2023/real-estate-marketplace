import { Link } from "react-router-dom";
import { useCompare } from "../context/CompareContext";

export default function CompareBar() {
  const { ids, clear } = useCompare();
  if (ids.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white rounded-full shadow-lg px-5 py-3 flex items-center gap-4 text-sm">
      <span>{ids.length} selected (max 3)</span>
      {ids.length >= 2 ? (
        <Link
          to="/compare"
          className="bg-emerald-500 hover:bg-emerald-600 px-4 py-1.5 rounded-full font-semibold"
        >
          Compare now
        </Link>
      ) : (
        <span className="text-gray-400">Pick at least 2</span>
      )}
      <button onClick={clear} className="text-gray-300 hover:text-white">
        Clear
      </button>
    </div>
  );
}