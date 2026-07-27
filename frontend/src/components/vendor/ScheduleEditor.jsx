import { useState, useEffect } from 'react';
import { restaurantsApi } from '../../api/restaurants.api';
import { Button } from '../ui/Button';

// dayOfWeek sigue la convención de JS: 0=Domingo … 6=Sábado (igual que el backend).
// Se muestran de lunes a domingo, pero se guardan con su valor real.
const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

const defaultRow = (dayOfWeek) => ({
  dayOfWeek,
  openTime: '08:00',
  closeTime: '22:00',
  isClosed: false,
});

export function ScheduleEditor({ restaurantId }) {
  const [rows, setRows] = useState(DAYS.map((d) => defaultRow(d.value)));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    restaurantsApi
      .getSchedules(restaurantId)
      .then(({ data }) => {
        const existing = data.schedules ?? [];
        // Para cada día, usa lo guardado o un default; así siempre hay 7 filas.
        setRows(
          DAYS.map((d) => existing.find((s) => s.dayOfWeek === d.value) ?? defaultRow(d.value)),
        );
      })
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const setField = (dayOfWeek, field, value) => {
    setRows((prev) =>
      prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, [field]: value } : r)),
    );
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      // Solo se envían los días abiertos con sus horas; los cerrados van con isClosed.
      const schedules = rows.map((r) => ({
        dayOfWeek: r.dayOfWeek,
        openTime: r.openTime,
        closeTime: r.closeTime,
        isClosed: r.isClosed,
      }));
      await restaurantsApi.setSchedules(restaurantId, { schedules });
      setMsg({ type: 'ok', text: 'Horarios guardados' });
    } catch (err) {
      setMsg({ type: 'err', text: err.response?.data?.message ?? 'Error al guardar horarios' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded-[10px] p-[14px]">
      <h2 className="text-[12px] font-bold text-txt mb-[4px]">Horario de atención</h2>
      <p className="text-[10px] text-txt-2 mb-[12px]">
        El restaurante aparecerá como abierto o cerrado automáticamente según este horario.
      </p>

      {loading ? (
        <p className="text-[11px] text-txt-2 py-2">Cargando horarios…</p>
      ) : (
        <div className="space-y-[6px]">
          {DAYS.map((d) => {
            const row = rows.find((r) => r.dayOfWeek === d.value);
            return (
              <div key={d.value} className="flex items-center gap-[10px]">
                <span className="w-[80px] text-[11px] font-medium text-txt">{d.label}</span>

                <label className="flex items-center gap-[5px] text-[10px] text-txt-2 cursor-pointer select-none w-[70px]">
                  <input
                    type="checkbox"
                    checked={!row.isClosed}
                    onChange={(e) => setField(d.value, 'isClosed', !e.target.checked)}
                  />
                  {row.isClosed ? 'Cerrado' : 'Abierto'}
                </label>

                <input
                  type="time"
                  value={row.openTime}
                  disabled={row.isClosed}
                  onChange={(e) => setField(d.value, 'openTime', e.target.value)}
                  className="bg-background border border-border rounded-[8px] px-2 py-[5px] text-[11px] text-txt disabled:opacity-50 focus:outline-none focus:border-primary"
                />
                <span className="text-[11px] text-txt-2">a</span>
                <input
                  type="time"
                  value={row.closeTime}
                  disabled={row.isClosed}
                  onChange={(e) => setField(d.value, 'closeTime', e.target.value)}
                  className="bg-background border border-border rounded-[8px] px-2 py-[5px] text-[11px] text-txt disabled:opacity-50 focus:outline-none focus:border-primary"
                />
              </div>
            );
          })}
        </div>
      )}

      {msg && (
        <p className={`text-[11px] mt-[10px] ${msg.type === 'ok' ? 'text-ok-text' : 'text-red-500'}`}>
          {msg.text}
        </p>
      )}

      <Button type="button" variant="primary" onClick={save} loading={saving} className="mt-[12px]">
        Guardar horarios
      </Button>
    </div>
  );
}
