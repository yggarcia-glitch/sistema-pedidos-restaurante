import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { productsApi } from '../../api/products.api';
import { restaurantsApi } from '../../api/restaurants.api';
import { Navbar } from '../../components/layout/Navbar';
import { BottomNav } from '../../components/layout/BottomNav';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';

export default function VendorMenuPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCatId, setActiveCatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    restaurantsApi.findAll({ limit: 1 }).then(({ data }) => {
      const r = data.data[0];
      if (!r) { setLoading(false); return; }
      setRestaurant(r);
      setCategories(r.categories ?? []);
      loadProducts(r.id, null);
    });
  }, []);

  const loadProducts = (restaurantId, catId) => {
    setLoading(true);
    productsApi
      .findAll(restaurantId, catId ? { categoryId: catId } : {})
      .then(({ data }) => setProducts(data))
      .finally(() => setLoading(false));
  };

  const openCreate = () => { reset({}); setEditing(null); setFormError(''); setModalOpen(true); };
  const openEdit = (product) => { reset(product); setEditing(product); setFormError(''); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await productsApi.update(editing.id, data);
      } else {
        await productsApi.create(restaurant.id, { ...data, price: Number(data.price) });
      }
      setModalOpen(false);
      loadProducts(restaurant.id, activeCatId);
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Error al guardar producto');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (product) => {
    await productsApi.toggleAvailability(product.id);
    loadProducts(restaurant.id, activeCatId);
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;
    await productsApi.remove(product.id);
    loadProducts(restaurant.id, activeCatId);
  };

  if (!restaurant && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center p-16 text-text-secondary">
          <p>No tienes un restaurante registrado aún.</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-text">Mi menú</h1>
          <Button size="sm" onClick={openCreate}>+ Nuevo producto</Button>
        </div>

        {/* Tabs de categoría */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
          <button
            onClick={() => { setActiveCatId(null); loadProducts(restaurant?.id, null); }}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium ${!activeCatId ? 'bg-primary text-white' : 'bg-white border border-border text-text-secondary'}`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCatId(cat.id); loadProducts(restaurant?.id, cat.id); }}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium ${activeCatId === cat.id ? 'bg-primary text-white' : 'bg-white border border-border text-text-secondary'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <PageSpinner />
        ) : (
          <div className="space-y-2">
            {products.map((product) => (
              <Card key={product.id} className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-text">{product.name}</p>
                  <p className="text-xs text-text-secondary">{product.category?.name} · ${Number(product.price).toFixed(2)}</p>
                </div>
                <Badge color={product.isAvailable ? 'green' : 'gray'}>
                  {product.isAvailable ? 'Disponible' : 'No disponible'}
                </Badge>
                <div className="flex gap-2">
                  <button onClick={() => handleToggle(product)} className="text-xs text-primary hover:underline">
                    {product.isAvailable ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => openEdit(product)} className="text-xs text-text-secondary hover:underline">Editar</button>
                  <button onClick={() => handleDelete(product)} className="text-xs text-red-400 hover:underline">Eliminar</button>
                </div>
              </Card>
            ))}
            {products.length === 0 && (
              <div className="text-center py-12 text-text-secondary">No hay productos en esta categoría</div>
            )}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar producto' : 'Nuevo producto'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input label="Nombre" error={errors.name?.message} {...register('name', { required: 'Obligatorio' })} />
          <Input label="Descripción" {...register('description')} />
          <Input label="Precio" type="number" step="0.01" error={errors.price?.message}
            {...register('price', { required: 'Obligatorio', min: { value: 0, message: 'Precio inválido' } })} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text">Categoría</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
              {...register('categoryId', { required: 'Selecciona una categoría' })}>
              <option value="">Seleccionar...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <span className="text-xs text-red-500">{errors.categoryId.message}</span>}
          </div>
          <Input label="URL de imagen (opcional)" {...register('imageUrl')} />
          {formError && <p className="text-xs text-red-500">{formError}</p>}
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </form>
      </Modal>

      <BottomNav />
    </div>
  );
}
