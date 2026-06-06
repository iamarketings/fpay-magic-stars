import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useBackoffice } from "@/hooks/use-backoffice";
import { MapPin, Globe } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icon issue (default icons broken with bundlers)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MOCK_LOCATIONS: { lat: number; lng: number; label: string; count: number }[] = [
  { lat: -18.8792, lng: 47.5079, label: "Antananarivo", count: 7 },
  { lat: -18.7669, lng: 46.8691, label: "Ambatondrazaka", count: 1 },
  { lat: -20.2875, lng: 44.2825, label: "Morondava", count: 1 },
  { lat: -17.8333, lng: 48.4167, label: "Toamasina", count: 2 },
  { lat: -23.35, lng: 43.6667, label: "Toliara", count: 1 },
  { lat: -12.2833, lng: 49.2833, label: "Antsiranana", count: 1 },
  { lat: -13.3833, lng: 48.4667, label: "Nosy Be", count: 1 },
  { lat: -21.4333, lng: 47.0833, label: "Fianarantsoa", count: 1 },
];

function createColoredIcon(color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 24px; height: 24px;
      background: linear-gradient(135deg, ${color}, #A855F7);
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      font-weight: 900;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

export default function BackofficeMap() {
  const { users } = useBackoffice();

  const locations = useMemo(() => {
    const baseTotal = MOCK_LOCATIONS.reduce((s, l) => s + l.count, 0);
    const factor = Math.max(1, Math.round(users.length / baseTotal));
    return MOCK_LOCATIONS.map(l => ({ ...l, count: l.count * factor }));
  }, [users]);

  const totalMarked = locations.reduce((s, l) => s + l.count, 0);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <Globe className="h-4 w-4 text-[#1864FF]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Localisation des Wallets</h3>
            <p className="text-[11px] text-slate-400">{totalMarked} wallets localisés</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg">
          <MapPin className="h-3 w-3" />
          OpenStreetMap
        </div>
      </div>

      {/* Carte Leaflet */}
      <div className="w-full h-[350px] relative z-0">
        <MapContainer
          center={[-19.5, 47.5]}
          zoom={6}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map((loc, i) => (
            <Marker
              key={i}
              position={[loc.lat, loc.lng]}
              icon={createColoredIcon(i === 0 ? "#1864FF" : i % 2 === 0 ? "#059669" : "#7C3AED")}
            >
              <Popup>
                <div className="text-center font-sans">
                  <p className="font-bold text-sm text-slate-900">{loc.label}</p>
                  <p className="text-xs text-slate-500">{loc.count} wallet(s)</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Stats footer */}
      <div className="grid grid-cols-4 gap-0 border-t border-slate-100">
        {[
          { label: "Villes", value: locations.length, color: "text-[#1864FF]" },
          { label: "Wallets localisés", value: totalMarked, color: "text-[#A855F7]" },
          { label: "Couverture", value: `${users.length > 0 ? Math.round((totalMarked / users.length) * 100) : 0}%`, color: "text-[#059669]" },
          { label: "Total wallets", value: users.length, color: "text-slate-600" },
        ].map((stat, i) => (
          <div key={i} className="py-3 text-center border-r border-slate-100 last:border-r-0">
            <p className={`text-lg font-black tabular-nums font-mono ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-slate-400 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
