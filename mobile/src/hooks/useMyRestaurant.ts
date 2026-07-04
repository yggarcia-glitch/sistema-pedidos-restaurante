import { useCallback, useEffect, useState } from 'react';
import { restaurantsApi } from '@/src/api/restaurants.api';
import { getApiError } from '@/src/api/axios';
import { Restaurant } from '@/src/types';
import { useAuth } from '@/src/hooks/useAuth';

// Resuelve el restaurante del vendedor autenticado.
// El backend no expone un endpoint "mi restaurante", así que se busca en el
// listado por ownerId === user.id.
export function useMyRestaurant() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await restaurantsApi.findAll({ limit: 100 });
      const mine = data.data.find((r) => r.ownerId === user.id) ?? null;
      setRestaurant(mine);
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { restaurant, loading, error, reload: load, setRestaurant };
}
