import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix de Leaflet: los íconos por defecto no cargan bien con Vite.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Marcador naranja (#E85D26) para restaurantes.
const orangeIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function MapCenter({ coords }) {
  const map = useMap();
  if (coords) map.setView([coords.lat, coords.lng], map.getZoom());
  return null;
}

const CUENCA = { lat: -2.9001, lng: -79.0059 };

export function RestaurantMap({ restaurants = [], userCoords }) {
  const navigate = useNavigate();
  const center = userCoords ?? CUENCA;

  return (
    <div className="bg-background border border-border rounded-[12px] overflow-hidden h-[200px] w-full">
      <MapContainer center={[center.lat, center.lng]} zoom={14} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapCenter coords={userCoords} />

        {/* Ubicación del usuario (marcador azul por defecto) */}
        {userCoords && (
          <Marker position={[userCoords.lat, userCoords.lng]}>
            <Popup>📍 Tu ubicación</Popup>
          </Marker>
        )}

        {/* Restaurantes (marcadores naranjas) */}
        {restaurants.map((r) => (
          <Marker key={r.id} position={[r.latitude, r.longitude]} icon={orangeIcon}>
            <Popup>
              <div className="min-w-[130px]">
                <p className="font-semibold text-[12px]">{r.name}</p>
                <p className="text-[11px] text-txt-2">★ {Number(r.rating ?? 0).toFixed(1)}</p>
                <button
                  onClick={() => navigate(`/restaurant/${r.id}`)}
                  className="mt-1 text-[11px] bg-primary text-white px-3 py-1 rounded-lg w-full"
                >
                  Ver menú
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
