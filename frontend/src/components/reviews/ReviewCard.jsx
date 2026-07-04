export function ReviewCard({ review }) {
  const { user, rating, comment, createdAt } = review;
  const stars = '⭐'.repeat(rating);
  const date = new Date(createdAt).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });

  return (
    <div className="py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold text-sm">
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="text-sm font-medium text-text">{user?.name}</p>
          <p className="text-xs text-text-secondary">{date}</p>
        </div>
        <span className="ml-auto text-sm">{stars}</span>
      </div>
      {comment && <p className="text-sm text-text-secondary mt-2">{comment}</p>}
    </div>
  );
}
