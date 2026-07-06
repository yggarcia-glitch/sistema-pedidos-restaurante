import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '@/src/constants/colors';
import { CUENCA } from '@/src/constants/api';
import { restaurantsApi } from '@/src/api/restaurants.api';
import { getApiError } from '@/src/api/axios';
import { Restaurant } from '@/src/types';
import { RestaurantCard } from '@/src/components/restaurants/RestaurantCard';
import { RestaurantMap } from '@/src/components/restaurants/RestaurantMap';
import { Spinner } from '@/src/components/ui/Spinner';

// Chips de categoría (filtran por nombre de categoría del restaurante).
const CATEGORIES: { label: string; kw: string | null }[] = [
  { label: 'Todo', kw: null },
  { label: '🔥 Rápido', kw: 'rápid' },
  { label: '🍕 Pizza', kw: 'pizza' },
  { label: '🍣 Sushi', kw: 'sushi' },
  { label: '🍗 Pollo', kw: 'pollo' },
  { label: '🥗 Saludable', kw: 'salud' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cityLabel, setCityLabel] = useState('Ubicando…');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeKw, setActiveKw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pide permiso de ubicación. Si lo deniega, usa Cuenca como fallback.
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setCoords(CUENCA);
          setCityLabel('Cuenca, Ecuador');
          return;
        }
        const pos = await Location.getCurrentPositionAsync({});
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        // Reverse geocoding para mostrar la ciudad actual
        try {
          const [place] = await Location.reverseGeocodeAsync({
            latitude: c.lat,
            longitude: c.lng,
          });
          setCityLabel(place?.city ?? place?.region ?? 'Tu ubicación');
        } catch {
          setCityLabel('Tu ubicación');
        }
      } catch {
        setCoords(CUENCA);
        setCityLabel('Cuenca, Ecuador');
      }
    })();
  }, []);

  const fetchNearby = useCallback(async () => {
    if (!coords) return;
    setError(null);
    try {
      const { data } = await restaurantsApi.findNearby({
        lat: coords.lat,
        lng: coords.lng,
        radiusKm: 10,
      });
      setRestaurants(data);
    } catch (e) {
      setError(getApiError(e, 'No se pudieron cargar los restaurantes cercanos'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [coords]);

  useEffect(() => {
    if (coords) fetchNearby();
  }, [coords, fetchNearby]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNearby();
  };

  const filtered = restaurants.filter((r) => {
    const matchName = r.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchCat =
      !activeKw ||
      r.categories?.some((c) => c.name.toLowerCase().includes(activeKw)) ||
      r.name.toLowerCase().includes(activeKw);
    return matchName && matchCat;
  });

  if (loading) return <Spinner text="Buscando restaurantes cercanos…" />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/(client)/restaurant/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <View>
            {/* Encabezado con ubicación */}
            <View style={styles.header}>
              <Ionicons name="location" size={20} color={Colors.primary} />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.headerLabel}>Entregar en</Text>
                <Text style={styles.headerCity}>{cityLabel}</Text>
              </View>
            </View>

            {/* Buscador */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={Colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar restaurantes o platillos…"
                placeholderTextColor={Colors.textTertiary}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Chips de categoría */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {CATEGORIES.map((cat) => {
                const active = activeKw === cat.kw;
                return (
                  <TouchableOpacity
                    key={cat.label}
                    onPress={() => setActiveKw(cat.kw)}
                    activeOpacity={0.8}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Mapa de cercanos */}
            <View style={styles.mapWrap}>
              <RestaurantMap
                restaurants={restaurants}
                userCoords={coords}
                onSelectRestaurant={(id) => router.push(`/(client)/restaurant/${id}`)}
                height={220}
              />
            </View>

            <Text style={styles.sectionTitle}>Cercanos a ti</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          !error ? (
            <View style={styles.empty}>
              <Ionicons name="restaurant-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>
                No hay restaurantes cercanos por ahora.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  headerLabel: { fontSize: 12, color: Colors.textSecondary },
  headerCity: { fontSize: 16, fontWeight: '700', color: Colors.text },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingRight: 4,
  },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },
  mapWrap: { marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  error: { color: Colors.dangerText, marginBottom: 12 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center' },
});
