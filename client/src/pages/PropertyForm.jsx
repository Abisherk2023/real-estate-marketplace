import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios";
import LocationPicker from "../components/LocationPicker";

const emptyForm = {
  title: "", description: "", price: "", listingType: "sale",
  propertyType: "house", bedrooms: 0, bathrooms: 0, area: "",
  address: "", city: "", latitude: "", longitude: "",
};

export default function PropertyForm() {
  const { id } = useParams(); // present only when editing
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/properties/${id}`)
      .then((res) => {
        const p = res.data;
        setForm({
          title: p.title, description: p.description, price: p.price,
          listingType: p.listingType, propertyType: p.propertyType,
          bedrooms: p.bedrooms, bathrooms: p.bathrooms, area: p.area || "",
          address: p.address, city: p.city, latitude: p.latitude ?? "", longitude: p.longitude ?? "",
        });
        setExistingImages(p.images || []);
      })
      .catch(() => setError("Could not load property"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length + files.length > 6) {
      setError("Maximum 6 images per property");
      return;
    }
    setError("");
    setNewFiles(files);
  };

  const removeExistingImage = async (public_id) => {
    if (!window.confirm("Remove this image?")) return;
    try {
      const { data } = await api.delete(`/properties/${id}/image`, {
        params: { public_id },
      });
      setExistingImages(data.images);
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    newFiles.forEach((file) => data.append("images", file));

    try {
      if (isEdit) await api.put(`/properties/${id}`, data);
      else await api.post("/properties", data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save property");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-12 text-gray-500">Loading...</p>;

  const inputClass = "w-full px-3 py-2 border rounded text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/dashboard" className="text-sm text-emerald-600 font-medium">
        ← Back to dashboard
      </Link>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow mt-4 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Edit property" : "Add new property"}
        </h1>

        {error && <p className="bg-red-50 text-red-600 p-2 rounded text-sm">{error}</p>}

        <div>
          <label className={labelClass}>Title</label>
          <input name="title" required value={form.title} onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" rows={4} required value={form.description} onChange={handleChange} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Price (Rs.)</label>
            <input name="price" type="number" min="0" required value={form.price} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Listing type</label>
            <select name="listingType" value={form.listingType} onChange={handleChange} className={inputClass}>
              <option value="sale">For sale</option>
              <option value="rent">For rent</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Property type</label>
            <select name="propertyType" value={form.propertyType} onChange={handleChange} className={inputClass}>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Bedrooms</label>
            <input name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Bathrooms</label>
            <input name="bathrooms" type="number" min="0" value={form.bathrooms} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Area (sqft)</label>
            <input name="area" type="number" min="0" value={form.area} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Address</label>
            <input name="address" required value={form.address} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input name="city" required value={form.city} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        {/* Location Picker */}
        <div>
          <label className={labelClass}>Location on map (optional, click to place a pin)</label>
          <LocationPicker
            lat={form.latitude}
            lng={form.longitude}
            onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))}
          />
        </div>

        {/* Existing images (edit mode) */}
        {existingImages.length > 0 && (
          <div>
            <label className={labelClass}>Current images</label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img) => (
                <div key={img.public_id} className="relative">
                  <img src={img.url} alt="" className="h-20 w-28 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.public_id)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New images */}
        <div>
          <label className={labelClass}>
            {isEdit ? "Add more images" : "Images"} (max 6 total, 5 MB each)
          </label>
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="text-sm" />

          {newFiles.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {newFiles.map((file) => (
                <img
                  key={file.name}
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="h-20 w-28 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>

        <button
          disabled={saving}
          className="w-full bg-emerald-600 text-white py-2.5 rounded font-semibold hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Update property" : "Create property"}
        </button>
      </form>
    </div>
  );
}