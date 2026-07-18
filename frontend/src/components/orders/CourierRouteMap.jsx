import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix de íconos por defecto de Leaflet con Vite.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const colorIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

const restaurantIcon = colorIcon('orange');
const homeIcon = colorIcon('red');

// Marcador del repartidor: pin circular con emoji de moto (se distingue y "se mueve").
const courierIcon = L.divIcon({
  className: '',
  html:
    '<div style="width:34px;height:34px;border-radius:9999px;background:#E85D26;' +
    'display:flex;align-items:center;justify-content:center;font-size:18px;' +
    'box-shadow:0 2px 6px rgba(0,0,0,.35);border:2px solid #fff;">🛵</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// Ruta real por calles usando el servidor demo público de OSRM (sin API key).
// Respaldo: línea recta si OSRM no responde.
async function fetchRoute(from, to) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM error');
    const data = await res.json();
    const coords = data?.routes?.[0]?.geometry?.coordinates;
    if (!coords) throw new Error('sin ruta');
    return coords.map(([lng, lat]) => [lat, lng]);
  } catch {
    return [
      [from.lat, from.lng],
      [to.lat, to.lng],
    ];
  }
}

// Ajusta el encuadre para que se vean todos los puntos/ruta.
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    const valid = points.filter(Boolean);
    if (valid.length === 0) return;
    if (valid.length === 1) {
      map.setView(valid[0], 15);
    } else {
      map.fitBounds(valid, { padding: [30, 30] });
    }
  }, [map, JSON.stringify(points)]);
  return null;
}

/**
 * Mapa de seguimiento tipo PedidosYa.
 * - restaurant / destination: { lat, lng }
 * - driver: { lat, lng } | null  (ubicación viva del repartidor)
 * Dibuja la ruta del repartidor (o del restaurante si aún no hay repartidor) al destino.
 */
export function CourierRouteMap({ restaurant, destination, driver }) {
  const [route, setRoute] = useState([]);

  // Origen de la ruta: el repartidor si ya tiene ubicación; si no, el restaurante.
  const origin = driver ?? restaurant;

  useEffect(() => {
    if (!origin || !destination) return;
    let active = true;
    fetchRoute(origin, destination).then((r) => {
      if (active) setRoute(r);
    });
    return () => {
      active = false;
    };
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

  if (!destination && !restaurant) return null;

  const center = origin ?? destination;
  const points = [
    restaurant && [restaurant.lat, restaurant.lng],
    destination && [destination.lat, destination.lng],
    driver && [driver.lat, driver.lng],
  ];

  return (
    <div className="rounded-[12px] overflow-hidden border border-border h-[220px] w-full mb-[14px]">
      <MapContainer center={[center.lat, center.lng]} zoom={14} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <FitBounds points={points} />

        {route.length > 0 && (
          <Polyline positions={route} pathOptions={{ color: '#E85D26', weight: 5, opacity: 0.85 }} />
        )}

        {restaurant && (
          <Marker position={[restaurant.lat, restaurant.lng]} icon={restaurantIcon}>
            <Popup>🏪 Restaurante</Popup>
          </Marker>
        )}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={homeIcon}>
            <Popup>📍 Destino de entrega</Popup>
          </Marker>
        )}
        {driver && (
          <Marker position={[driver.lat, driver.lng]} icon={courierIcon}>
            <Popup>🛵 Tu repartidor</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
