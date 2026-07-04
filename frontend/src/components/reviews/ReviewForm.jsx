import { useState } from 'react';
import { reviewsApi } from '../../api/reviews.api';
import { Button } from '../ui/Button';

export function ReviewForm({ restaurantId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setError('Selecciona una calificación'); return; }
    setLoading(true);
    try {
      await reviewsApi.create({ restaurantId, rating, comment });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al enviar reseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            className={`text-2xl ${s <= rating ? 'opacity-100' : 'opacity-30'} transition-opacity`}
          >
            ⭐
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Cuéntanos tu experiencia (opcional)"
        rows={3}
        className="w-full px-3 py-2 rounded-xl border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Enviando...' : 'Publicar reseña'}
      </Button>
    </form>
  );
}
