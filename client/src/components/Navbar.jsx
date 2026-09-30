import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unread } = useSocket();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isAgent = user?.role === "agent" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  return (
    <nav className="bg-white shadow sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-emerald-600">
          🏠 HomeFinder
        </Link>

        <div className="flex items-center gap-5 text-sm font-medium text-gray-700">
          <Link to="/properties" className="hover:text-emerald-600">Properties</Link>

          {user ? (
            <>
              <Link to="/messages" className="relative hover:text-emerald-600">
  💬 Messages
  {unread > 0 && (
    <span className="absolute -top-2 -right-4 bg-red-500 text-white text-[10px] rounded-full px-1.5">
      {unread}
    </span>
  )}
</Link>
              <Link to="/favorites" className="hover:text-emerald-600">♥ Saved</Link>
              {isAgent && (
                <Link to="/dashboard" className="hover:text-emerald-600">Dashboard</Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="hover:text-emerald-600">Admin</Link>
              )}
              <span className="text-gray-500">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-emerald-600">Login</Link>
              <Link
                to="/register"
                className="bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}