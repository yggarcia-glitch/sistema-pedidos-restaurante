import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { restaurantsApi } from '../../api/restaurants.api';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

// Cuenca, Ecuador — centro por defecto para nuevos restaurantes.
const CUENCA = { lat: -2.9001, lng: -79.0059 };

const NUMERIC = ['deliveryTime', 'deliveryFee', 'minOrder', 'latitude', 'longitude'];

export function CreateRestaurantForm({ onCreated }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      latitude: CUENCA.lat,
      longitude: CUENCA.lng,
      city: 'Cuenca',
      province: 'Azuay',
    },
  });

  const onSubmit = async (form) => {
    setSaving(true);
    setError('');
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v === '' || v === null || v === undefined) return;
        payload[k] = NUMERIC.includes(k) ? Number(v) : v;
      });
      const { data } = await restaurantsApi.create(payload);
      onCreated(data);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al crear el restaurante');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-[22px] max-w-2xl">
      <div className="bg-white border border-border rounded-[10px] p-[18px] mb-[14px]">
        <h1 className="text-[15px] font-bold text-txt mb-[4px]">Crea tu restaurante</h1>
        <p className="text-[12px] text-txt-2">
          Todavía no tienes un local registrado. Completa estos datos para empezar a vender.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[10px]">
        {/* Datos generales */}
        <div className="bg-white border border-border rounded-[10px] p-[14px]">
          <h2 className="text-[12px] font-bold text-txt mb-[10px]">Datos generales</h2>
          <div className="space-y-[10px]">
            <Input
              label="Nombre del restaurante"
              error={errors.name?.message}
              {...register('name', { required: 'Obligatorio' })}
            />
            <Input label="Descripción" {...register('description')} />
            <Input label="Teléfono" {...register('phone')} />
          </div>
        </div>

        {/* Dirección */}
        <div className="bg-white border border-border rounded-[10px] p-[14px]">
          <h2 className="text-[12px] font-bold text-txt mb-[10px]">Dirección</h2>
          <div className="space-y-[10px]">
            <Input
              label="Calle"
              error={errors.street?.message}
              {...register('street', { required: 'Obligatorio' })}
            />
            <div className="flex gap-[10px]">
              <Input
                label="Ciudad"
                className="flex-1"
                error={errors.city?.message}
                {...register('city', { required: 'Obligatorio' })}
              />
              <Input
                label="Provincia"
                className="flex-1"
                error={errors.province?.message}
                {...register('province', { required: 'Obligatorio' })}
              />
            </div>
            <div className="flex gap-[10px]">
              <Input
                label="Latitud"
                type="number"
                step="0.0001"
                className="flex-1"
                error={errors.latitude?.message}
                {...register('latitude', { required: 'Obligatorio' })}
              />
              <Input
                label="Longitud"
                type="number"
                step="0.0001"
                className="flex-1"
                error={errors.longitude?.message}
                {...register('longitude', { required: 'Obligatorio' })}
              />
            </div>
            <p className="text-[10px] text-txt-3">
              Vienen precargadas con el centro de Cuenca — ajústalas a la ubicación real de tu
              local.
            </p>
          </div>
        </div>

        {/* Entrega */}
        <div className="bg-white border border-border rounded-[10px] p-[14px]">
          <h2 className="text-[12px] font-bold text-txt mb-[10px]">Entrega</h2>
          <div className="flex gap-[10px]">
            <Input
              label="Tiempo (min)"
              type="number"
              className="flex-1"
              {...register('deliveryTime')}
            />
            <Input
              label="Costo de envío ($)"
              type="number"
              step="0.01"
              className="flex-1"
              {...register('deliveryFee')}
            />
            <Input
              label="Pedido mínimo ($)"
              type="number"
              step="0.01"
              className="flex-1"
              {...register('minOrder')}
            />
          </div>
        </div>

        {/* Imágenes */}
        <div className="bg-white border border-border rounded-[10px] p-[14px]">
          <h2 className="text-[12px] font-bold text-txt mb-[10px]">Imágenes (URL, opcional)</h2>
          <div className="space-y-[10px]">
            <Input label="Logo" placeholder="https://…" {...register('logoUrl')} />
            <Input label="Portada" placeholder="https://…" {...register('coverUrl')} />
          </div>
        </div>

        {error && <p className="text-[11px] text-red-500">{error}</p>}

        <Button type="submit" variant="primary" loading={saving}>
          Crear restaurante
        </Button>
      </form>
    </div>
  );
}
