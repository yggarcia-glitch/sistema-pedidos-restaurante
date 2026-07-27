/**
 * Utilidades de horario de atención. Puras (sin dependencias de Nest/Prisma)
 * para poder reutilizarlas desde RestaurantsService y OrdersService.
 *
 * Los restaurantes son de Cuenca, Ecuador → se evalúa la hora en la zona
 * horaria local (UTC-5, sin horario de verano). Esto es clave porque el
 * servidor (Render) corre en UTC: usar la hora del servidor daría el estado
 * corrido 5 horas.
 */

const TIMEZONE = 'America/Guayaquil';

const DAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export interface ScheduleLike {
  dayOfWeek: number;
  openTime: string; // "HH:MM"
  closeTime: string; // "HH:MM"
  isClosed: boolean;
}

/** Día de la semana (0=Dom) y hora "HH:MM" actuales en la zona del restaurante. */
function nowInTimezone(now = new Date()): { dayOfWeek: number; time: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  let hour = get('hour');
  if (hour === '24') hour = '00'; // algunos entornos devuelven "24" a medianoche
  return { dayOfWeek: DAY_INDEX[get('weekday')], time: `${hour}:${get('minute')}` };
}

/** ¿El horario indica que está abierto ahora mismo? */
export function isOpenBySchedule(schedules: ScheduleLike[], now = new Date()): boolean {
  const { dayOfWeek, time } = nowInTimezone(now);
  const today = schedules.find((s) => s.dayOfWeek === dayOfWeek);
  if (!today || today.isClosed) return false;

  // Horario normal (abre y cierra el mismo día): 10:00–22:00.
  if (today.openTime <= today.closeTime) {
    return time >= today.openTime && time <= today.closeTime;
  }
  // Horario que cruza medianoche (ej. 18:00–02:00): abierto si es después de
  // la apertura o antes del cierre de la madrugada.
  return time >= today.openTime || time <= today.closeTime;
}

/**
 * Estado efectivo de apertura combinando el flag manual y el horario:
 * - Si el vendedor cerró manualmente (isOpen=false) → cerrado (override).
 * - Si no hay horarios cargados → se respeta el flag manual (compatibilidad).
 * - Si hay horarios → se calcula según la hora actual.
 */
export function computeIsOpenNow(
  isOpen: boolean,
  schedules: ScheduleLike[] | undefined | null,
  now = new Date(),
): boolean {
  if (!isOpen) return false;
  if (!schedules || schedules.length === 0) return isOpen;
  return isOpenBySchedule(schedules, now);
}
