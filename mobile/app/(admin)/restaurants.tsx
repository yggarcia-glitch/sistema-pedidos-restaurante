import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { money } from '@/src/constants/status';
import { Restaurant } from '@/src/types';
import { restaurantsApi } from '@/src/api/restaurants.api';
import { getApiError } from '@/src/api/axios';
import { Spinner } from '@/src/components/ui/Spinner';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { CategoryTabs } from '@/src/components/restaurants/CategoryTabs';

type Filter = 'todos' | 'activos' | 'inactivos';

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filter, setFilter] = useState<Filter>('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await restaurantsApi.findAll({ limit: 100 });
      setRestaurants(data.data);
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const setActive = async (r: Restaurant, isActive: boolean) => {
    try {
      const { data } = await restaurantsApi.update(r.id, { isActive });
      setRestaurants((prev) => prev.map((x) => (x.id === r.id ? data : x)));
    } catch (e) {
      setError(getApiError(e));
    }
  };

  if (loading) return <Spinner text="Cargando restaurantes…" />;

  const filtered = restaurants.filter((r) => {
    if (filter === 'activos') return r.isActive;
    if (filter === 'inactivos') return !r.isActive;
    return true;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Restaurantes</Text>
      <CategoryTabs
        includeAll={false}
        activeId={filter}
        onSelect={(id) => setFilter((id as Filter) ?? 'todos')}
        items={[
          { id: 'todos', name: 'Todos' },
          { id: 'activos', name: 'Activos' },
          { id: 'inactivos', name: 'Inactivos' },
        ]}
      />
      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Badge
                label={item.isActive ? 'Activo' : 'Inactivo'}
                type={item.isActive ? 'ok' : 'danger'}
              />
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.meta}>{item.city}</Text>
              <Ionicons name="star" size={14} color="#F5A623" style={{ marginLeft: 10 }} />
              <Text style={styles.meta}>{item.rating.toFixed(1)}</Text>
              <Text style={styles.meta}> · Envío {money(item.deliveryFee)}</Text>
            </View>
            <View style={styles.actions}>
              {item.isActive ? (
                <Button
                  title="Desactivar"
                  variant="danger"
                  onPress={() => setActive(item, false)}
                  fullWidth
                />
              ) : (
                <Button
                  title="Aprobar / Activar"
                  onPress={() => setActive(item, true)}
                  fullWidth
                />
              )}
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>{error ?? 'No hay restaurantes.'}</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  list: { padding: 16 },
  card: { marginBottom: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  name: { fontSize: 16, fontWeight: '700', color: Colors.text, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  meta: { fontSize: 13, color: Colors.textSecondary, marginLeft: 4 },
  actions: { marginTop: 12 },
  empty: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: 40 },
});
