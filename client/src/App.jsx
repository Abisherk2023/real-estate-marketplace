import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
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
import NotFound from "./pages/NotFound";
import Messages from "./pages/Messages";
import VerificationRequest from "./pages/VerificationRequest";
import Compare from "./pages/Compare";
import CompareBar from "./components/CompareBar";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
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
            path="/dashboard/properties/:id/edit"
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
          <Route path="*" element={<NotFound />} />
          <Route
  path="/messages"
  element={
    <ProtectedRoute>
      <Messages />
    </ProtectedRoute>
  }
/>
<Route
  path="/messages/:id"
  element={
    <ProtectedRoute>
      <Messages />
    </ProtectedRoute>
  }
/>
          <Route
  path="/dashboard/verification"
  element={
    <ProtectedRoute roles={["agent"]}>
      <VerificationRequest />
    </ProtectedRoute>
  }
/>
       <Route path="/compare" element={<Compare />} />
        </Routes>
      </main>
      <Footer />
      <CompareBar />
    </div>
  );
}