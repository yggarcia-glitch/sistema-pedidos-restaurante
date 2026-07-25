import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { productsApi } from '../../api/products.api';
import { useMyRestaurant } from '../../hooks/useMyRestaurant';
import { SidebarLayout } from '../../components/layout/SidebarLayout';
import { TopBar } from '../../components/layout/TopBar';
import { CategoryTabs } from '../../components/restaurants/CategoryTabs';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { money } from '../../lib/format';

export default function VendorMenuPage() {
  const { restaurant, loading: rLoading } = useMyRestaurant();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCatId, setActiveCatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!restaurant) return;
    setCategories(restaurant.categories ?? []);
    loadProducts(restaurant.id, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant]);

  const loadProducts = (restaurantId, catId) => {
    setLoading(true);
    productsApi
      .findAll(restaurantId, catId ? { categoryId: catId } : {})
      .then(({ data }) => setProducts(data))
      .finally(() => setLoading(false));
  };

  const changeCat = (catId) => {
    setActiveCatId(catId);
    loadProducts(restaurant?.id, catId);
  };

  const openCreate = () => { reset({}); setEditing(null); setFormError(''); setModalOpen(true); };
  const openEdit = (product) => { reset(product); setEditing(product); setFormError(''); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await productsApi.update(editing.id, { ...data, price: Number(data.price) });
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

  const catTabs = [
    { value: null, label: 'Todos' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  if (!restaurant && !rLoading) {
    return (
      <SidebarLayout>
        <div className="p-[18px] text-[12px] text-txt-2">
          No tienes un restaurante registrado aún.{' '}
          <Link to="/vendor/dashboard" className="text-primary font-semibold">
            Créalo desde el Dashboard
          </Link>
          .
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <TopBar
        title="Gestión del menú"
        subtitle={restaurant?.name}
        actions={<Button size="sm" onClick={openCreate}>+ Nuevo producto</Button>}
      />
      <div className="p-[22px]">
        <div className="mb-[12px]">
          <CategoryTabs items={catTabs} active={activeCatId} onChange={changeCat} />
        </div>

        {loading || rLoading ? (
          <PageSpinner />
        ) : products.length === 0 ? (
          <p className="text-center text-[12px] text-txt-2 py-8">No hay productos todavía</p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-border rounded-[10px] p-[10px] mb-[8px] flex justify-between items-center"
            >
              <div className="flex items-center min-w-0">
                <div className="w-[40px] h-[40px] bg-background rounded-[8px] flex-shrink-0 overflow-hidden">
                  {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="ml-[10px] min-w-0">
                  <p className="font-bold text-[13px] text-txt truncate">{product.name}</p>
                  <p className="text-primary font-bold text-[12px]">{money(product.price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-[8px] flex-shrink-0">
                <button onClick={() => handleToggle(product)}>
                  <Badge type={product.isAvailable ? 'ok' : 'default'}>
                    {product.isAvailable ? 'Activo' : 'Inactivo'}
                  </Badge>
                </button>
                <span onClick={() => openEdit(product)} className="cursor-pointer">✏️</span>
                <span onClick={() => handleDelete(product)} className="cursor-pointer">🗑</span>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar producto' : 'Nuevo producto'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input label="Nombre" error={errors.name?.message} {...register('name', { required: 'Obligatorio' })} />
          <Input label="Descripción" {...register('description')} />
          <Input
            label="Precio"
            type="number"
            step="0.01"
            error={errors.price?.message}
            {...register('price', { required: 'Obligatorio', min: { value: 0, message: 'Precio inválido' } })}
          />
          <div>
            <label className="block text-[11px] font-medium text-txt-2 mb-1">Categoría</label>
            <select
              className="bg-background border border-border rounded-[8px] px-3 py-2 text-[12px] text-txt w-full focus:outline-none focus:border-primary"
              {...register('categoryId', { required: 'Selecciona una categoría' })}
            >
              <option value="">Seleccionar...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="block text-[10px] text-red-500 mt-1">{errors.categoryId.message}</span>
            )}
          </div>
          <Input label="URL de imagen (opcional)" {...register('imageUrl')} />
          {formError && <p className="text-[10px] text-red-500">{formError}</p>}
          <Button type="submit" variant="primary" fullWidth loading={saving}>
            {editing ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </form>
      </Modal>
    </SidebarLayout>
  );
}
