import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authApi } from '../../api/auth.api';
import { restaurantsApi } from '../../api/restaurants.api';
import { categoriesApi } from '../../api/categories.api';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

// Cuenca, Ecuador — centro por defecto para nuevos restaurantes.
const CUENCA = { lat: -2.9001, lng: -79.0059 };

const NUMERIC = ['deliveryTime', 'deliveryFee', 'minOrder', 'latitude', 'longitude'];

export function CreateRestaurantModal({ open, onClose, onCreated }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // Categorías propias que se le crearán al local al momento de registrarlo.
  // (Adicionales a las categorías genéricas globales, que ya están disponibles
  // para todos los restaurantes automáticamente.)
  const [cats, setCats] = useState([]);
  const [catInput, setCatInput] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      latitude: CUENCA.lat,
      longitude: CUENCA.lng,
      city: 'Cuenca',
      province: 'Azuay',
    },
  });

  const close = () => {
    setError('');
    setCats([]);
    setCatInput('');
    reset();
    onClose();
  };

  const addCat = () => {
    const name = catInput.trim();
    if (!name) return;
    // Evita duplicados (case-insensitive).
    if (cats.some((c) => c.toLowerCase() === name.toLowerCase())) {
      setCatInput('');
      return;
    }
    setCats((prev) => [...prev, name]);
    setCatInput('');
  };

  const removeCat = (name) => setCats((prev) => prev.filter((c) => c !== name));

  const onSubmit = async (form) => {
    setSaving(true);
    setError('');
    try {
      // 1) Crea la cuenta del vendedor dueño del local.
      const { data: registered } = await authApi.register({
        name: form.ownerName,
        email: form.ownerEmail,
        password: form.ownerPassword,
        phone: form.ownerPhone || undefined,
        role: 'VENDEDOR',
      });

      // 2) Crea el restaurante a nombre de ese vendedor.
      const restaurantPayload = { ownerId: registered.user.id };
      [
        'name', 'description', 'phone', 'street', 'city', 'province',
        'latitude', 'longitude', 'deliveryTime', 'deliveryFee', 'minOrder',
        'logoUrl', 'coverUrl',
      ].forEach((k) => {
        const v = form[k];
        if (v === '' || v === null || v === undefined) return;
        restaurantPayload[k] = NUMERIC.includes(k) ? Number(v) : v;
      });

      const { data: restaurant } = await restaurantsApi.create(restaurantPayload);

      // 3) Crea las categorías propias del local (si el admin agregó alguna).
      //    Van con sortOrder incremental para respetar el orden ingresado.
      for (let i = 0; i < cats.length; i++) {
        await categoriesApi.create(restaurant.id, { name: cats[i], sortOrder: i });
      }

      onCreated(restaurant);
      close();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al crear el local');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Nuevo local">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[14px] max-h-[70vh] overflow-y-auto pr-1">
        {/* Cuenta del vendedor */}
        <div>
          <h4 className="text-[11px] font-bold text-txt-2 uppercase mb-[8px]">
            Cuenta del vendedor
          </h4>
          <div className="space-y-[8px]">
            <Input
              label="Nombre del dueño"
              error={errors.ownerName?.message}
              {...register('ownerName', { required: 'Obligatorio' })}
            />
            <Input
              label="Email"
              type="email"
              error={errors.ownerEmail?.message}
              {...register('ownerEmail', { required: 'Obligatorio' })}
            />
            <Input
              label="Contraseña temporal"
              type="password"
              error={errors.ownerPassword?.message}
              {...register('ownerPassword', {
                required: 'Obligatorio',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
            />
            <Input label="Teléfono (opcional)" {...register('ownerPhone')} />
          </div>
        </div>

        {/* Datos del local */}
        <div>
          <h4 className="text-[11px] font-bold text-txt-2 uppercase mb-[8px]">Datos del local</h4>
          <div className="space-y-[8px]">
            <Input
              label="Nombre del restaurante"
              error={errors.name?.message}
              {...register('name', { required: 'Obligatorio' })}
            />
            <Input label="Descripción" {...register('description')} />
            <Input
              label="Calle"
              error={errors.street?.message}
              {...register('street', { required: 'Obligatorio' })}
            />
            <div className="flex gap-[8px]">
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
            <div className="flex gap-[8px]">
              <Input
                label="Latitud"
                type="number"
                step="0.0001"
                className="flex-1"
                {...register('latitude', { required: 'Obligatorio' })}
              />
              <Input
                label="Longitud"
                type="number"
                step="0.0001"
                className="flex-1"
                {...register('longitude', { required: 'Obligatorio' })}
              />
            </div>
          </div>
        </div>

        {/* Entrega */}
        <div>
          <h4 className="text-[11px] font-bold text-txt-2 uppercase mb-[8px]">Entrega</h4>
          <div className="flex gap-[8px]">
            <Input label="Tiempo (min)" type="number" className="flex-1" {...register('deliveryTime')} />
            <Input label="Envío ($)" type="number" step="0.01" className="flex-1" {...register('deliveryFee')} />
            <Input label="Mín. pedido ($)" type="number" step="0.01" className="flex-1" {...register('minOrder')} />
          </div>
        </div>

        {/* Categorías del local */}
        <div>
          <h4 className="text-[11px] font-bold text-txt-2 uppercase mb-[8px]">
            Categorías del local (opcional)
          </h4>
          <p className="text-[10px] text-txt-2 mb-[8px]">
            Además de las categorías genéricas, puedes crearle categorías propias.
          </p>
          <div className="flex gap-[8px]">
            <Input
              className="flex-1"
              placeholder="Ej: Especialidades de la casa"
              value={catInput}
              onChange={(e) => setCatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addCat(); }
              }}
            />
            <Button type="button" size="sm" variant="outline" onClick={addCat}>
              Añadir
            </Button>
          </div>
          {cats.length > 0 && (
            <div className="flex flex-wrap gap-[6px] mt-[8px]">
              {cats.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-[6px] bg-background border border-border rounded-full px-[10px] py-[4px] text-[11px] text-txt"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => removeCat(c)}
                    className="text-txt-2 hover:text-red-500 cursor-pointer leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-[11px] text-red-500">{error}</p>}

        <Button type="submit" variant="primary" fullWidth loading={saving}>
          Crear vendedor y local
        </Button>
      </form>
    </Modal>
  );
}
