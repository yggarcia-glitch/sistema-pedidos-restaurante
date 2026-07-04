import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { money } from '@/src/constants/status';
import { Category, Product } from '@/src/types';
import { productsApi } from '@/src/api/products.api';
import { restaurantsApi } from '@/src/api/restaurants.api';
import { getApiError } from '@/src/api/axios';
import { useMyRestaurant } from '@/src/hooks/useMyRestaurant';
import { notify } from '@/src/utils/dialog';
import { Spinner } from '@/src/components/ui/Spinner';
import { Card } from '@/src/components/ui/Card';
import { Modal } from '@/src/components/ui/Modal';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { CategoryTabs } from '@/src/components/restaurants/CategoryTabs';

export default function VendorMenu() {
  const { restaurant, loading: loadingRestaurant } = useMyRestaurant();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '' });

  const load = useCallback(async () => {
    if (!restaurant) return;
    try {
      const [pRes, rRes] = await Promise.all([
        productsApi.findAll(restaurant.id),
        restaurantsApi.findOne(restaurant.id),
      ]);
      setProducts(pRes.data);
      setCategories(rRes.data.categories ?? []);
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setLoading(false);
    }
  }, [restaurant]);

  useEffect(() => {
    if (restaurant) load();
  }, [restaurant, load]);

  const toggleAvailability = async (product: Product) => {
    try {
      const { data } = await productsApi.toggleAvailability(product.id);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? data : p)));
    } catch (e) {
      setError(getApiError(e));
    }
  };

  const handleCreate = async () => {
    if (!restaurant) return;
    if (!form.name.trim() || !form.price || !form.categoryId) {
      notify('Faltan datos', 'Completa nombre, precio y categoría.');
      return;
    }
    setSaving(true);
    try {
      await productsApi.create(restaurant.id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        categoryId: form.categoryId,
      });
      setModalOpen(false);
      setForm({ name: '', description: '', price: '', categoryId: '' });
      await load();
    } catch (e) {
      notify('Error', getApiError(e));
    } finally {
      setSaving(false);
    }
  };

  if (loadingRestaurant || loading) return <Spinner text="Cargando menú…" />;

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.empty}>
          No tienes un restaurante registrado todavía.
        </Text>
      </SafeAreaView>
    );
  }

  const filtered = activeCat
    ? products.filter((p) => (p.category?.id ?? p.categoryId) === activeCat)
    : products;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Menú</Text>
      {categories.length > 0 && (
        <CategoryTabs
          items={categories.map((c) => ({ id: c.id, name: c.name }))}
          activeId={activeCat}
          onSelect={setActiveCat}
        />
      )}
      <ScrollView contentContainerStyle={styles.content}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No hay productos. Agrega el primero con el botón +.</Text>
        ) : (
          filtered.map((p) => (
            <Card key={p.id} style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.price}>{money(p.price)}</Text>
              </View>
              <Switch
                value={p.isAvailable}
                onValueChange={() => toggleAvailability(p)}
                trackColor={{ true: Colors.primary }}
              />
            </Card>
          ))
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      {/* FAB nuevo producto */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => {
          setForm({ name: '', description: '', price: '', categoryId: categories[0]?.id ?? '' });
          setModalOpen(true);
        }}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>

      <Modal visible={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo producto">
        <Input
          label="Nombre"
          value={form.name}
          onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
        />
        <Input
          label="Descripción"
          value={form.description}
          onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
        />
        <Input
          label="Precio"
          keyboardType="decimal-pad"
          value={form.price}
          onChangeText={(t) => setForm((f) => ({ ...f, price: t }))}
        />
        <Text style={styles.catLabel}>Categoría</Text>
        <View style={styles.catRow}>
          {categories.map((c) => {
            const active = form.categoryId === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.catPill, active && styles.catPillActive]}
                onPress={() => setForm((f) => ({ ...f, categoryId: c.id }))}
              >
                <Text style={[styles.catText, active && styles.catTextActive]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Button title="Crear producto" onPress={handleCreate} loading={saving} fullWidth />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  content: { padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.text },
  price: { fontSize: 14, color: Colors.primary, fontWeight: '700', marginTop: 4 },
  empty: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: 40 },
  errorText: { color: Colors.dangerText, marginTop: 12 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  catLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  catPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { color: Colors.textSecondary, fontWeight: '600' },
  catTextActive: { color: Colors.white },
});
