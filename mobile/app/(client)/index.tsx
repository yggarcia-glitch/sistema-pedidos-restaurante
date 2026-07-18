import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Radius } from '@/src/constants/colors';
import { CUENCA } from '@/src/constants/api';
import { restaurantsApi } from '@/src/api/restaurants.api';
import { getApiError } from '@/src/api/axios';
import { Restaurant } from '@/src/types';
import { useClientTheme, Palette } from '@/src/theme/ClientThemeContext';
import { RestaurantCard } from '@/src/components/restaurants/RestaurantCard';
import { RestaurantCardSkeleton } from '@/src/components/restaurants/RestaurantCardSkeleton';
import { RestaurantMap } from '@/src/components/restaurants/RestaurantMap';
import { Skeleton } from '@/src/components/ui/Skeleton';

// Chips de categoría (filtran por nombre de categoría del restaurante).
const CATEGORIES: { label: string; kw: string | null }[] = [
  { label: 'Todo', kw: null },
  { label: '🔥 Rápido', kw: 'rápid' },
  { label: '🍕 Pizza', kw: 'pizza' },
  { label: '🍣 Sushi', kw: 'sushi' },
  { label: '🍗 Pollo', kw: 'pollo' },
  { label: '🥗 Saludable', kw: 'salud' },
];

const RADIUS_OPTIONS = [1, 3, 5, 10];

type QuickFilter = 'abierto' | 'mejorCalificado' | 'masCercano' | null;
type ViewMode = 'map' | 'list';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useClientTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cityLabel, setCityLabel] = useState('Ubicando…');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeKw, setActiveKw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(5);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');

  const FilterChip = ({
    icon,
    label,
    active,
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
      <Ionicons name={icon} size={14} color={active ? colors.white : colors.textSecondary} />
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const ViewToggleBtn = ({
    icon,
    label,
    active,
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.viewToggleBtn, active && styles.viewToggleBtnActive]}
    >
      <Ionicons name={icon} size={16} color={active ? colors.white : colors.textSecondary} />
      <Text style={[styles.viewToggleText, active && styles.viewToggleTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

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
        radiusKm,
      });
      setRestaurants(data);
    } catch (e) {
      setError(getApiError(e, 'No se pudieron cargar los restaurantes cercanos'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [coords, radiusKm]);

  useEffect(() => {
    if (coords) fetchNearby();
  }, [coords, fetchNearby]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNearby();
  };

  let filtered = restaurants.filter((r) => {
    const matchName = r.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchCat =
      !activeKw ||
      r.categories?.some((c) => c.name.toLowerCase().includes(activeKw)) ||
      r.name.toLowerCase().includes(activeKw);
    return matchName && matchCat;
  });

  if (quickFilter === 'abierto') filtered = filtered.filter((r) => r.isOpen);
  if (quickFilter === 'mejorCalificado') {
    filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  }
  if (quickFilter === 'masCercano') {
    filtered = [...filtered].sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
  }

  const header = (
    <View>
      {/* Encabezado con ubicación */}
      <View style={styles.header}>
        <Ionicons name="location" size={20} color={colors.primary} />
        <View style={{ marginLeft: 6 }}>
          <Text style={styles.headerLabel}>Entregar en</Text>
          <Text style={styles.headerCity}>{cityLabel}</Text>
        </View>
      </View>

      {/* Buscador: siempre visible, sin navegar a otra pestaña */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar restaurantes o platillos…"
          placeholderTextColor={colors.textTertiary}
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

      {/* Radio de búsqueda ajustable */}
      <View style={styles.radiusRow}>
        <Text style={styles.radiusLabel}>Radio</Text>
        {RADIUS_OPTIONS.map((km) => {
          const active = radiusKm === km;
          return (
            <TouchableOpacity
              key={km}
              onPress={() => setRadiusKm(km)}
              activeOpacity={0.8}
              style={[styles.radiusChip, active && styles.radiusChipActive]}
            >
              <Text style={[styles.radiusChipText, active && styles.radiusChipTextActive]}>
                {km} km
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filtros rápidos sobre el mapa */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        <FilterChip
          icon="checkmark-circle-outline"
          label="Abierto ahora"
          active={quickFilter === 'abierto'}
          onPress={() => setQuickFilter((f) => (f === 'abierto' ? null : 'abierto'))}
        />
        <FilterChip
          icon="star-outline"
          label="Mejor calificado"
          active={quickFilter === 'mejorCalificado'}
          onPress={() => setQuickFilter((f) => (f === 'mejorCalificado' ? null : 'mejorCalificado'))}
        />
        <FilterChip
          icon="navigate-outline"
          label="Más cercano"
          active={quickFilter === 'masCercano'}
          onPress={() => setQuickFilter((f) => (f === 'masCercano' ? null : 'masCercano'))}
        />
      </ScrollView>

      {/* Toggle vista Mapa / Lista */}
      <View style={styles.viewToggle}>
        <ViewToggleBtn
          icon="map"
          label="Mapa"
          active={viewMode === 'map'}
          onPress={() => setViewMode('map')}
        />
        <ViewToggleBtn
          icon="list"
          label="Lista"
          active={viewMode === 'list'}
          onPress={() => setViewMode('list')}
        />
      </View>

      {/* El mapa ES la pantalla principal: hero grande en modo Mapa,
          franja compacta en modo Lista. */}
      <View style={styles.mapWrap}>
        {loading ? (
          <Skeleton height={viewMode === 'map' ? 320 : 160} borderRadius={8} />
        ) : (
          <RestaurantMap
            restaurants={restaurants}
            userCoords={coords}
            onSelectRestaurant={(id) => router.push(`/(client)/restaurant/${id}`)}
            height={viewMode === 'map' ? 320 : 160}
          />
        )}
      </View>

      {/* Modo Mapa: carrusel horizontal de vista rápida (no reemplaza la lista completa) */}
      {viewMode === 'map' && !loading && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {filtered.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.carouselCard}
              activeOpacity={0.9}
              onPress={() => router.push(`/(client)/restaurant/${r.id}`)}
            >
              <Text style={styles.carouselName} numberOfLines={1}>
                {r.name}
              </Text>
              <Text style={styles.carouselMeta}>
                ⭐ {r.rating.toFixed(1)} · {r.deliveryTime ?? 30} min
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Text style={styles.sectionTitle}>Cercanos a ti</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={loading ? [] : viewMode === 'list' ? filtered : []}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/(client)/restaurant/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={header}
        ListFooterComponent={
          loading ? (
            <View>
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading && !error && viewMode === 'list' ? (
            <View style={styles.empty}>
              <Ionicons name="restaurant-outline" size={48} color={colors.textTertiary} />
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

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    list: { padding: 16 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    headerLabel: { fontSize: 12, color: colors.textSecondary },
    headerCity: { fontSize: 16, fontWeight: '700', color: colors.text },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: Radius.pill,
      paddingHorizontal: 16,
      height: 46,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    searchInput: { flex: 1, fontSize: 14, color: colors.text },
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
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    chipTextActive: { color: colors.white },
    radiusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    radiusLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginRight: 2 },
    radiusChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: Radius.pill,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
    },
    radiusChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
    radiusChipText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    radiusChipTextActive: { color: colors.primaryDark },
    filtersRow: { flexDirection: 'row', gap: 8, paddingBottom: 12 },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: Radius.pill,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterChipText: { fontSize: 12.5, fontWeight: '600', color: colors.textSecondary },
    filterChipTextActive: { color: colors.white },
    viewToggle: {
      flexDirection: 'row',
      backgroundColor: colors.white,
      borderRadius: Radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 3,
      marginBottom: 10,
      alignSelf: 'flex-start',
    },
    viewToggleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: Radius.pill,
    },
    viewToggleBtnActive: { backgroundColor: colors.primary },
    viewToggleText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
    viewToggleTextActive: { color: colors.white },
    mapWrap: { marginTop: 4 },
    carousel: { gap: 10, paddingVertical: 12 },
    carouselCard: {
      width: 160,
      backgroundColor: colors.white,
      borderRadius: Radius.card,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    carouselName: { fontSize: 14, fontWeight: '800', color: colors.text },
    carouselMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginTop: 20,
      marginBottom: 12,
    },
    error: { color: colors.dangerText, marginBottom: 12 },
    empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
    emptyText: { color: colors.textSecondary, fontSize: 15, textAlign: 'center' },
  });
