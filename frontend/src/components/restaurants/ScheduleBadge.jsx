import { Badge } from '../ui/Badge';

export function ScheduleBadge({ schedules = [] }) {
  const now = new Date();
  const day = now.getDay();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const today = schedules.find((s) => s.dayOfWeek === day);
  const isOpen = today && !today.isClosed && time >= today.openTime && time <= today.closeTime;

  return (
    <div className="flex items-center gap-2">
      <Badge color={isOpen ? 'green' : 'red'}>{isOpen ? '● Abierto ahora' : '● Cerrado'}</Badge>
      {today && !today.isClosed && (
        <span className="text-xs text-text-secondary">
          {today.openTime} – {today.closeTime}
        </span>
      )}
    </div>
  );
}
