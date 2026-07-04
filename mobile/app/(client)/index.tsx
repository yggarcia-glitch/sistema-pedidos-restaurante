import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { CUENCA } from '@/src/constants/api';
import { restaurantsApi } from '@/src/api/restaurants.api';
import { getApiError } from '@/src/api/axios';
import { Restaurant } from '@/src/types';
import { RestaurantCard } from '@/src/components/restaurants/RestaurantCard';
import { RestaurantMap } from '@/src/components/restaurants/RestaurantMap';
import { Spinner } from '@/src/components/ui/Spinner';

export default function HomeScreen() {
  const router = useRouter();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cityLabel, setCityLabel] = useState('Ubicando…');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
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

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

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
                placeholder="Buscar restaurantes"
                placeholderTextColor={Colors.textTertiary}
                value={search}
                onChangeText={setSearch}
              />
            </View>

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
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  mapWrap: { marginTop: 16 },
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
