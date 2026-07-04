import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { money } from '@/src/constants/status';
import { restaurantsApi } from '@/src/api/restaurants.api';
import { productsApi } from '@/src/api/products.api';
import { getApiError } from '@/src/api/axios';
import { Product, Restaurant } from '@/src/types';
import { useCart } from '@/src/hooks/useCart';
import { Spinner } from '@/src/components/ui/Spinner';
import { Badge } from '@/src/components/ui/Badge';
import { ProductCard } from '@/src/components/products/ProductCard';
import { ProductModal } from '@/src/components/products/ProductModal';

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { itemCount, subtotal, addItem, loading: cartLoading } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [rRes, pRes] = await Promise.all([
          restaurantsApi.findOne(id),
          productsApi.findAll(id),
        ]);
        setRestaurant(rRes.data);
        setProducts(pRes.data);
      } catch (e) {
        setError(getApiError(e, 'No se pudo cargar el restaurante'));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Agrupa los productos por categoría para la SectionList.
  const sections = useMemo(() => {
    const byCat = new Map<string, { title: string; data: Product[] }>();
    products.forEach((p) => {
      const key = p.category?.id ?? p.categoryId;
      const title = p.category?.name ?? 'Otros';
      if (!byCat.has(key)) byCat.set(key, { title, data: [] });
      byCat.get(key)!.data.push(p);
    });
    return Array.from(byCat.values());
  }, [products]);

  const handleConfirm = async (quantity: number, choiceIds: string[]) => {
    if (!selected) return;
    try {
      await addItem(selected, quantity, choiceIds);
      setSelected(null);
    } catch (e) {
      setError(getApiError(e, 'No se pudo agregar al carrito'));
    }
  };

  if (loading) return <Spinner text="Cargando menú…" />;
  if (error && !restaurant) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    );
  }
  if (!restaurant) return null;

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => setSelected(item)} />
        )}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        ListHeaderComponent={
          <View>
            {/* Portada + botón back */}
            <View>
              <Image
                source={{
                  uri:
                    restaurant.coverUrl ??
                    `https://placehold.co/800x400/E85D26/FFFFFF/png?text=${encodeURIComponent(
                      restaurant.name,
                    )}`,
                }}
                style={styles.cover}
              />
              <SafeAreaView edges={['top']} style={styles.backWrap}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={22} color={Colors.text} />
                </TouchableOpacity>
              </SafeAreaView>
            </View>

            <View style={styles.info}>
              <Text style={styles.name}>{restaurant.name}</Text>
              {restaurant.description ? (
                <Text style={styles.desc}>{restaurant.description}</Text>
              ) : null}
              <View style={styles.metaRow}>
                <Badge
                  label={restaurant.isOpen ? 'Abierto' : 'Cerrado'}
                  type={restaurant.isOpen ? 'ok' : 'danger'}
                />
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={14} color="#F5A623" />
                  <Text style={styles.metaText}>
                    {restaurant.rating.toFixed(1)} ({restaurant.totalReviews})
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{restaurant.deliveryTime ?? 30} min</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="bicycle-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{money(restaurant.deliveryFee)}</Text>
                </View>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Este restaurante aún no tiene productos.</Text>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Botón flotante del carrito */}
      {itemCount > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          activeOpacity={0.9}
          onPress={() => router.push('/(client)/cart')}
        >
          <View style={styles.floatingBadge}>
            <Text style={styles.floatingBadgeText}>{itemCount}</Text>
          </View>
          <Text style={styles.floatingText}>Ver carrito</Text>
          <Text style={styles.floatingText}>{money(subtotal)}</Text>
        </TouchableOpacity>
      )}

      <ProductModal
        product={selected}
        visible={!!selected}
        loading={cartLoading}
        onClose={() => setSelected(null)}
        onConfirm={handleConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: Colors.dangerText, fontSize: 15, textAlign: 'center' },
  cover: { width: '100%', height: 200, backgroundColor: Colors.border },
  backWrap: { position: 'absolute', top: 0, left: 0 },
  backBtn: {
    margin: 12,
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  info: { padding: 16, backgroundColor: Colors.white },
  name: { fontSize: 22, fontWeight: '800', color: Colors.text },
  desc: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: Colors.textSecondary },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: Colors.background,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    padding: 40,
  },
  floatingCart: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  floatingBadge: {
    backgroundColor: Colors.white,
    borderRadius: 999,
    minWidth: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  floatingBadgeText: { color: Colors.primary, fontWeight: '800' },
  floatingText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
});
