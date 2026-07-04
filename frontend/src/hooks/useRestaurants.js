import { useState, useEffect } from 'react';
import { restaurantsApi } from '../api/restaurants.api';

export function useRestaurants(params = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    restaurantsApi
      .findAll({ page, ...params })
      .then(({ data: res }) => {
        setData(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((e) => setError(e.response?.data?.message ?? 'Error al cargar restaurantes'))
      .finally(() => setLoading(false));
  }, [page, JSON.stringify(params)]);

  return { data, total, page, totalPages, loading, error, setPage };
}
