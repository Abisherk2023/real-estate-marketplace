import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../utils/leafletIcon";

const JAFFNA = [9.6615, 80.0255];

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ lat, lng, onChange }) {
  const hasPin = lat !== "" && lat != null && lng !== "" && lng != null;
  const position = hasPin ? [Number(lat), Number(lng)] : null;

  return (
    <div>
      <MapContainer
        center={position || JAFFNA}
        zoom={hasPin ? 15 : 10}
        className="h-72 w-full rounded-lg z-0"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} />
        {position && <Marker position={position} />}
      </MapContainer>

      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <span>
          {hasPin
            ? `Pin: ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`
            : "No pin set. Click the map to place one."}
        </span>
        {hasPin && (
          <button
            type="button"
            onClick={() => onChange("", "")}
            className="text-red-600 hover:underline"
          >
            Remove pin
          </button>
        )}
      </div>
    </div>
  );
}