import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/src/constants/colors';
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

// Barra horizontal de categorías (se usa dentro del scroll y también fija arriba).
function CatBar({
  titles,
  active,
  onSelect,
}: {
  titles: string[];
  active: string | null;
  onSelect: (title: string, index: number) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.catBar}
    >
      {titles.map((t, i) => {
        const on = active === t;
        return (
          <TouchableOpacity
            key={`${t}-${i}`}
            onPress={() => onSelect(t, i)}
            activeOpacity={0.8}
            style={[styles.catPill, on && styles.catPillActive]}
          >
            <Text style={[styles.catText, on && styles.catTextActive]}>{t}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { itemCount, subtotal, addItem, loading: cartLoading } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const listRef = useRef<SectionList<Product>>(null);

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

  const titles = useMemo(() => sections.map((s) => s.title), [sections]);

  useEffect(() => {
    if (activeCat === null && titles.length) setActiveCat(titles[0]);
  }, [titles, activeCat]);

  // Resalta la categoría visible mientras se hace scroll (ref estable).
  const onViewRef = useRef(
    ({ viewableItems }: { viewableItems: { section?: { title: string } }[] }) => {
      const first = viewableItems.find((v) => v.section);
      if (first?.section) setActiveCat(first.section.title);
    },
  );
  const viewConfigRef = useRef({ itemVisiblePercentThreshold: 40 });

  const jumpTo = (title: string, index: number) => {
    setActiveCat(title);
    listRef.current?.scrollToLocation({
      sectionIndex: index,
      itemIndex: 0,
      viewOffset: 96,
      animated: true,
    });
  };

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
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          setShowStickyBar(y > 230);
        }}
        scrollEventThrottle={32}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => setSelected(item)} />
        )}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        ListHeaderComponent={
          <View>
            {/* Portada + back + favorito */}
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
              <SafeAreaView edges={['top']} style={styles.coverTop}>
                <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={22} color={Colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.circleBtn}>
                  <Ionicons name="heart-outline" size={22} color={Colors.text} />
                </TouchableOpacity>
              </SafeAreaView>
              {/* Logo del local sobre la portada */}
              <View style={styles.logo}>
                {restaurant.logoUrl ? (
                  <Image source={{ uri: restaurant.logoUrl }} style={styles.logoImg} />
                ) : (
                  <Ionicons name="restaurant" size={26} color={Colors.primary} />
                )}
              </View>
            </View>

            <View style={styles.info}>
              <Text style={styles.name}>{restaurant.name}</Text>
              {restaurant.description ? (
                <Text style={styles.desc}>{restaurant.description}</Text>
              ) : null}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={14} color={Colors.amber} />
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
                <View style={styles.metaItem}>
                  <Ionicons name="receipt-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>Mín. {money(restaurant.minOrder)}</Text>
                </View>
                <Badge
                  label={restaurant.isOpen ? 'Abierto' : 'Cerrado'}
                  type={restaurant.isOpen ? 'ok' : 'danger'}
                />
              </View>
            </View>

            {/* Barra de categorías (dentro del scroll) */}
            {titles.length > 0 && (
              <View style={styles.catBarWrap}>
                <CatBar titles={titles} active={activeCat} onSelect={jumpTo} />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Este restaurante aún no tiene productos.</Text>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Barra de categorías FIJA arriba (aparece al hacer scroll) */}
      {showStickyBar && titles.length > 0 && (
        <SafeAreaView edges={['top']} style={styles.stickyBar}>
          <View style={styles.stickyRow}>
            <TouchableOpacity style={styles.stickyBack} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={Colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <CatBar titles={titles} active={activeCat} onSelect={jumpTo} />
            </View>
          </View>
        </SafeAreaView>
      )}

      {/* Barra flotante del carrito */}
      {itemCount > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          activeOpacity={0.9}
          onPress={() => router.push('/(client)/cart')}
        >
          <View style={styles.floatingLeft}>
            <View style={styles.floatingBadge}>
              <Text style={styles.floatingBadgeText}>{itemCount}</Text>
            </View>
            <Text style={styles.floatingText}>Ver carrito</Text>
          </View>
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
  coverTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  circleBtn: {
    marginTop: 12,
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  logo: {
    position: 'absolute',
    bottom: -22,
    left: 16,
    width: 56,
    height: 56,
    borderRadius: Radius.logo,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadow.card,
  },
  logoImg: { width: '100%', height: '100%' },
  info: { paddingHorizontal: 16, paddingTop: 30, paddingBottom: 8, backgroundColor: Colors.white },
  name: { fontSize: 20, fontWeight: '800', color: Colors.text },
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
  catBarWrap: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  catBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  catPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  catTextActive: { color: Colors.white },
  stickyBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadow.card,
  },
  stickyRow: { flexDirection: 'row', alignItems: 'center' },
  stickyBack: { paddingLeft: 12, paddingRight: 4 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Colors.background,
  },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, padding: 40 },
  floatingCart: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: Radius.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    ...Shadow.card,
    shadowOpacity: 0.25,
  },
  floatingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
