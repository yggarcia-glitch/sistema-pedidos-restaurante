import { useState, useEffect } from 'react';
import { restaurantsApi } from '../api/restaurants.api';

// Coordenadas de Cuenca, Ecuador como fallback
const CUENCA = { lat: -2.9001, lng: -79.0059 };

export function useNearby() {
  const [coords, setCoords] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCoords(CUENCA);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => setCoords({ lat: c.latitude, lng: c.longitude }),
      () => setCoords(CUENCA),
      { timeout: 5000 },
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    restaurantsApi
      .findNearby({ lat: coords.lat, lng: coords.lng, radiusKm: 10 })
      .then(({ data }) => setNearby(data))
      .catch((e) => setError(e.response?.data?.message ?? 'Error al buscar restaurantes cercanos'))
      .finally(() => setLoading(false));
  }, [coords]);

  return { coords, nearby, loading, error };
}
