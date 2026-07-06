import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '@/src/constants/colors';
import { Order, OrderStatus } from '@/src/types';
import { ordersApi } from '@/src/api/orders.api';
import { getApiError } from '@/src/api/axios';
import { OrderCard } from '@/src/components/orders/OrderCard';
import { Spinner } from '@/src/components/ui/Spinner';

type Filter = 'todos' | 'entregados' | 'cancelados';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'entregados', label: 'Entregados' },
  { id: 'cancelados', label: 'Cancelados' },
];

export default function HistoryScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('todos');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await ordersApi.findAll({ limit: 50 });
      setOrders(data.data); // respuesta paginada -> data.data
    } catch (e) {
      setError(getApiError(e, 'No se pudieron cargar tus pedidos'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Recarga cada vez que la pantalla toma foco (al volver desde tracking).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = orders.filter((o) => {
    if (filter === 'entregados') return o.estado.nombre === OrderStatus.ENTREGADO;
    if (filter === 'cancelados')
      return (
        o.estado.nombre === OrderStatus.CANCELADO ||
        o.estado.nombre === OrderStatus.RECHAZADO
      );
    return true;
  });

  if (loading) return <Spinner text="Cargando pedidos…" />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.header}>Mis pedidos</Text>
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              onPress={() => setFilter(f.id)}
              activeOpacity={0.8}
              style={[styles.filterBtn, active && styles.filterBtnActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={Colors.primary}
          />
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => router.push(`/(client)/tracking/${item.id}`)}
            onRepeat={
              item.restaurant
                ? () => router.push(`/(client)/restaurant/${item.restaurantId}`)
                : undefined
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>
              {error ?? 'Todavía no tienes pedidos.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  list: { padding: 16 },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  filterBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center' },
});
