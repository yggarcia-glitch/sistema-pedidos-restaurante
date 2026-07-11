export interface Coords {
  lat: number;
  lng: number;
}

// Misma fórmula que el backend (src/common/utils/geo.util.ts). Error típico < 0.5%.
export function haversineDistanceKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Ruta real (siguiendo calles) entre dos puntos usando el servidor demo público de OSRM.
// Sin API key. Es un servicio compartido, no apto para producción/alto tráfico.
export async function fetchRoute(
  from: Coords,
  to: Coords,
): Promise<{ latitude: number; longitude: number }[]> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.lng},${from.lat};${to.lng},${to.lat}` +
    `?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM respondió con error');
    const data = await res.json();
    const coords: [number, number][] | undefined = data?.routes?.[0]?.geometry?.coordinates;
    if (!coords) throw new Error('Ruta no encontrada');
    return coords.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
  } catch {
    // Sin conexión a OSRM: se dibuja una línea recta como respaldo.
    return [
      { latitude: from.lat, longitude: from.lng },
      { latitude: to.lat, longitude: to.lng },
    ];
  }
}
