import { useState, useEffect } from 'react';
import { restaurantsApi } from '../api/restaurants.api';
import { useAuth } from './useAuth';

// Devuelve el restaurante del vendedor autenticado.
// El backend no expone "mi restaurante": se busca en el listado por ownerId.
export function useMyRestaurant() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    restaurantsApi
      .findAll({ limit: 100 })
      .then(({ data }) => {
        const mine = (data.data ?? []).find((r) => r.ownerId === user.id) ?? null;
        setRestaurant(mine);
      })
      .finally(() => setLoading(false));
  }, [user]);

  return { restaurant, setRestaurant, loading };
}
