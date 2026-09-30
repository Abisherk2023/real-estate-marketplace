import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ImageGallery from "../components/ImageGallery";
import InquiryForm from "../components/InquiryForm";
import PropertyMap from "../components/PropertyMap";
import EmiCalculator from "../components/EmiCalculator";
import { useAuth } from "../context/AuthContext";
import VerifiedBadge from "../components/VerifiedBadge";
import ReportButton from "../components/ReportButton";
import SimilarProperties from "../components/SimilarProperties";

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch property details by ID
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/properties/${id}`);
        setProperty(data);
      } catch (err) {
        setError(err.response?.data?.message || "Property not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Remember recently viewed properties (max 6)
  useEffect(() => {
    if (!property?._id) return;
    try {
      const list = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
      const next = [property._id, ...list.filter((x) => x !== property._id)].slice(0, 6);
      localStorage.setItem("recentlyViewed", JSON.stringify(next));
    } catch (e) {
      // storage blocked, ignore
    }
  }, [property?._id]);

  if (loading) return <p className="text-center mt-12 text-gray-500">Loading...</p>;
  if (error || !property)
    return (
      <div className="text-center mt-12">
        <p className="text-gray-600 mb-3">{error || "Property not found"}</p>
        <Link to="/properties" className="text-emerald-600 font-medium">
          ← Back to listings
        </Link>
      </div>
    );

  const isOwner = user && user._id === property.agent?._id;

  const startChat = async () => {
    if (!user) return navigate("/login");
    try {
      const { data } = await api.post("/chat/conversations", { propertyId: id });
      navigate(`/messages/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Could not start chat");
    }
  };

  const {
    title, description, price, listingType, propertyType,
    bedrooms, bathrooms, area, address, city, images, agent, createdAt,
  } = property;

  const stat = (label, value) => (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-lg font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/properties" className="text-sm text-emerald-600 font-medium">
        ← Back to listings
      </Link>

      <div className="grid gap-8 lg:grid-cols-3 mt-4">
        {/* Left: gallery + details */}
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery images={images} title={title} />

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <p className="text-gray-500">📍 {address}, {city}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">
                  Rs. {price.toLocaleString()}
                  {listingType === "rent" && (
                    <span className="text-sm text-gray-500"> /month</span>
                  )}
                </p>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded text-white ${
                    listingType === "sale" ? "bg-emerald-600" : "bg-blue-600"
                  }`}
                >
                  For {listingType}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {stat("Bedrooms", bedrooms)}
              {stat("Bathrooms", bathrooms)}
              {stat("Area (sqft)", area || "-")}
              {stat("Type", propertyType)}
            </div>

            <h2 className="font-bold text-gray-800 mt-6 mb-2">Description</h2>
            <p className="text-gray-600 whitespace-pre-line">{description}</p>

            {property.latitude != null && property.longitude != null && (
              <>
                <h2 className="font-bold text-gray-800 mt-6 mb-2">Location</h2>
                <PropertyMap lat={property.latitude} lng={property.longitude} />
              </>
            )}

            <p className="text-xs text-gray-400 mt-4">
              Listed on {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Right: agent + inquiry */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold text-gray-800 mb-3">Listed by</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-700">{agent?.name}</p>
              {agent?.verificationStatus === "verified" && <VerifiedBadge />}
            </div>
            {agent?.phone && <p className="text-sm text-gray-500">📞 {agent.phone}</p>}
            {agent?.email && <p className="text-sm text-gray-500">✉️ {agent.email}</p>}

            {!isOwner && (
              <button
                onClick={startChat}
                className="mt-4 w-full bg-emerald-600 text-white py-2 rounded font-semibold hover:bg-emerald-700"
              >
                💬 Chat with agent
              </button>
            )}
            {!isOwner && <ReportButton propertyId={id} />}
          </div>

          <InquiryForm propertyId={id} />
          {listingType === "sale" && <EmiCalculator price={price} />}
        </div>
      </div>

      <SimilarProperties propertyId={id} />
    </div>
  );
}