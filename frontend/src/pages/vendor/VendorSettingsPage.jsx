import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { restaurantsApi } from '../../api/restaurants.api';
import { useMyRestaurant } from '../../hooks/useMyRestaurant';
import { SidebarLayout } from '../../components/layout/SidebarLayout';
import { TopBar } from '../../components/layout/TopBar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import { ScheduleEditor } from '../../components/vendor/ScheduleEditor';

// Campos numéricos que deben enviarse como Number al backend.
const NUMERIC = ['deliveryTime', 'deliveryFee', 'minOrder'];

export default function VendorSettingsPage() {
  const { restaurant, setRestaurant, loading } = useMyRestaurant();
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [msg, setMsg] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!restaurant) return;
    reset({
      name: restaurant.name ?? '',
      description: restaurant.description ?? '',
      phone: restaurant.phone ?? '',
      street: restaurant.street ?? '',
      city: restaurant.city ?? '',
      province: restaurant.province ?? '',
      deliveryTime: restaurant.deliveryTime ?? '',
      deliveryFee: restaurant.deliveryFee ?? '',
      minOrder: restaurant.minOrder ?? '',
      logoUrl: restaurant.logoUrl ?? '',
      coverUrl: restaurant.coverUrl ?? '',
    });
  }, [restaurant, reset]);

  const onSubmit = async (form) => {
    setSaving(true);
    setMsg(null);
    try {
      // Limpia strings vacíos y castea numéricos.
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v === '' || v === null || v === undefined) return;
        payload[k] = NUMERIC.includes(k) ? Number(v) : v;
      });
      const { data } = await restaurantsApi.update(restaurant.id, payload);
      setRestaurant((r) => ({ ...r, ...data }));
      setMsg({ type: 'ok', text: 'Cambios guardados correctamente' });
    } catch (err) {
      setMsg({ type: 'err', text: err.response?.data?.message ?? 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  const toggleOpen = async () => {
    setToggling(true);
    try {
      const { data } = await restaurantsApi.toggleOpen(restaurant.id);
      setRestaurant((r) => ({ ...r, isOpen: data.isOpen }));
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <SidebarLayout><PageSpinner /></SidebarLayout>;

  if (!restaurant) {
    return (
      <SidebarLayout>
        <div className="p-[18px] text-[12px] text-txt-2">
          No tienes un restaurante registrado aún.
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <TopBar
        title="Configuración"
        subtitle={restaurant.name}
        actions={
          <button
            onClick={toggleOpen}
            disabled={toggling}
            className={`flex items-center gap-[6px] px-[12px] py-[7px] rounded-full text-[11px] font-semibold border transition-colors ${
              restaurant.isOpen ? 'bg-ok text-ok-text border-ok' : 'bg-background text-txt-2 border-border'
            }`}
          >
            <span className={`w-[7px] h-[7px] rounded-full ${restaurant.isOpen ? 'bg-ok-text' : 'bg-txt-3'}`} />
            {restaurant.isOpen ? 'Abierto' : 'Cerrado'}
          </button>
        }
      />
      <div className="p-[22px] max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-[10px]">
          {/* Datos generales */}
          <div className="bg-white border border-border rounded-[10px] p-[14px]">
            <h2 className="text-[12px] font-bold text-txt mb-[10px]">Datos generales</h2>
            <div className="space-y-[10px]">
              <Input label="Nombre" error={errors.name?.message}
                {...register('name', { required: 'Obligatorio' })} />
              <Input label="Descripción" {...register('description')} />
              <Input label="Teléfono" {...register('phone')} />
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-white border border-border rounded-[10px] p-[14px]">
            <h2 className="text-[12px] font-bold text-txt mb-[10px]">Dirección</h2>
            <div className="space-y-[10px]">
              <Input label="Calle" {...register('street')} />
              <div className="flex gap-[10px]">
                <Input label="Ciudad" className="flex-1" {...register('city')} />
                <Input label="Provincia" className="flex-1" {...register('province')} />
              </div>
            </div>
          </div>

          {/* Entrega */}
          <div className="bg-white border border-border rounded-[10px] p-[14px]">
            <h2 className="text-[12px] font-bold text-txt mb-[10px]">Entrega</h2>
            <div className="flex gap-[10px]">
              <Input label="Tiempo (min)" type="number" className="flex-1" {...register('deliveryTime')} />
              <Input label="Costo de envío ($)" type="number" step="0.01" className="flex-1" {...register('deliveryFee')} />
              <Input label="Pedido mínimo ($)" type="number" step="0.01" className="flex-1" {...register('minOrder')} />
            </div>
          </div>

          {/* Imágenes */}
          <div className="bg-white border border-border rounded-[10px] p-[14px]">
            <h2 className="text-[12px] font-bold text-txt mb-[10px]">Imágenes (URL)</h2>
            <div className="space-y-[10px]">
              <Input label="Logo" placeholder="https://…" {...register('logoUrl')} />
              <Input label="Portada" placeholder="https://…" {...register('coverUrl')} />
            </div>
          </div>

          {msg && (
            <p className={`text-[11px] ${msg.type === 'ok' ? 'text-ok-text' : 'text-red-500'}`}>
              {msg.text}
            </p>
          )}

          <Button type="submit" variant="primary" loading={saving}>
            Guardar cambios
          </Button>
        </form>

        {/* Horario de atención (se guarda por separado) */}
        <div className="mt-[10px]">
          <ScheduleEditor restaurantId={restaurant.id} />
        </div>
      </div>
    </SidebarLayout>
  );
}
