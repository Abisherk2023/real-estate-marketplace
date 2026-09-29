import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PropertyDetail from "./pages/PropertyDetail";
import Dashboard from "./pages/Dashboard";
import PropertyForm from "./pages/PropertyForm";
import ProtectedRoute from "./components/ProtectedRoute";
import Favorites from "./pages/Favorites";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Listings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route
  path="/dashboard"
  element={
    <ProtectedRoute roles={["agent", "admin"]}>
      <Dashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/dashboard/properties/new"
  element={
    <ProtectedRoute roles={["agent", "admin"]}>
      <PropertyForm />
    </ProtectedRoute>
  }
/>

<Route
  path="/favorites"
  element={
    <ProtectedRoute>
      <Favorites />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin"
  element={
    <ProtectedRoute roles={["admin"]}>
      <AdminPanel />
    </ProtectedRoute>
  }
/>
<Route
  path="/dashboard/properties/:id/edit"
  element={
    <ProtectedRoute roles={["agent", "admin"]}>
      <PropertyForm />
    </ProtectedRoute>
  }
/>
      </Routes>
    </div>
  );
}