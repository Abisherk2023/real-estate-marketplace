import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../utils/leafletIcon";

export default function PropertyMap({ lat, lng }) {
  const position = [Number(lat), Number(lng)];
  if (!Number.isFinite(position[0]) || !Number.isFinite(position[1])) return null;

  return (
    <MapContainer
      center={position}
      zoom={15}
      scrollWheelZoom={false}
      className="h-72 w-full rounded-lg z-0"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} />
    </MapContainer>
  );
}