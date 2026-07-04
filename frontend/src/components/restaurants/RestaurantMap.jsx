import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix de Leaflet: los íconos por defecto no se cargan bien con Vite/webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const orangeIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Componente interno que actualiza el centro del mapa cuando cambian las coords
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
    <div className="h-64 rounded-2xl overflow-hidden border border-border">
      <MapContainer center={[center.lat, center.lng]} zoom={14} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Actualiza vista cuando cambia la ubicación del usuario */}
        <MapCenter coords={userCoords} />

        {/* Marcador de ubicación del usuario */}
        {userCoords && (
          <Marker position={[userCoords.lat, userCoords.lng]}>
            <Popup>📍 Tu ubicación</Popup>
          </Marker>
        )}

        {/* Marcadores naranjas para cada restaurante */}
        {restaurants.map((r) => (
          <Marker
            key={r.id}
            position={[r.latitude, r.longitude]}
            icon={orangeIcon}
          >
            <Popup>
              <div className="min-w-[140px]">
                <p className="font-semibold text-sm">{r.name}</p>
                {r.rating > 0 && <p className="text-xs text-gray-500">⭐ {r.rating.toFixed(1)}</p>}
                <button
                  onClick={() => navigate(`/restaurant/${r.id}`)}
                  className="mt-2 text-xs bg-primary text-white px-3 py-1 rounded-lg w-full"
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
