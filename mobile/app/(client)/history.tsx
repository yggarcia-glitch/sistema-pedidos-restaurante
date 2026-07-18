import React, { useCallback, useMemo, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Radius } from '@/src/constants/colors';
import { useClientTheme, Palette } from '@/src/theme/ClientThemeContext';
import { Order, OrderStatus } from '@/src/types';
import { ordersApi } from '@/src/api/orders.api';
import { cartApi } from '@/src/api/cart.api';
import { getApiError } from '@/src/api/axios';
import { useCart } from '@/src/hooks/useCart';
import { confirmAction, notify } from '@/src/utils/dialog';
import { OrderCard } from '@/src/components/orders/OrderCard';
import { OrderCardSkeleton } from '@/src/components/orders/OrderCardSkeleton';
import { RatingModal } from '@/src/components/reviews/RatingModal';

type Filter = 'todos' | 'entregados' | 'cancelados';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'entregados', label: 'Entregados' },
  { id: 'cancelados', label: 'Cancelados' },
];

export default function HistoryScreen() {
  const router = useRouter();
  const { colors } = useClientTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { cart, restaurantId, clearCart, fetchCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('todos');
  const [error, setError] = useState<string | null>(null);
  const [repeatingId, setRepeatingId] = useState<string | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [rateOrder, setRateOrder] = useState<Order | null>(null);

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

  const isReviewed = useCallback(
    async (orderId: string) => {
      if (reviewedIds.has(orderId)) return true;
      const flag = await AsyncStorage.getItem(`reviewed:${orderId}`);
      return flag === '1';
    },
    [reviewedIds],
  );

  const openRating = async (order: Order) => {
    if (await isReviewed(order.id)) {
      notify('Ya calificaste este pedido', 'Gracias por tu opinión.');
      return;
    }
    setRateOrder(order);
  };

  const handleRated = async () => {
    if (!rateOrder) return;
    await AsyncStorage.setItem(`reviewed:${rateOrder.id}`, '1');
    setReviewedIds((prev) => new Set(prev).add(rateOrder.id));
    setRateOrder(null);
    notify('¡Gracias!', 'Tu calificación fue enviada.');
  };

  // Repetir pedido: agrega los mismos ítems reales al carrito (no solo navega
  // al menú). Si el carrito tiene items de otro restaurante, confirma vaciarlo.
  const doRepeat = async (order: Order) => {
    if (!order.items?.length) return;
    setRepeatingId(order.id);
    try {
      for (const item of order.items) {
        await cartApi.addItem({
          productId: item.productId,
          quantity: item.quantity,
          choiceIds: item.choices?.map((c) => c.choiceId) ?? [],
          notes: item.notes ?? undefined,
        });
      }
      await fetchCart();
      router.push('/(client)/cart');
    } catch (e) {
      notify('No se pudo repetir el pedido', getApiError(e));
    } finally {
      setRepeatingId(null);
    }
  };

  const handleRepeat = (order: Order) => {
    const hasItems = (cart?.items?.length ?? 0) > 0;
    if (hasItems && restaurantId && restaurantId !== order.restaurantId) {
      confirmAction(
        'Vaciar carrito',
        'Tu carrito tiene productos de otro restaurante. ¿Deseas vaciarlo y repetir este pedido?',
        async () => {
          await clearCart();
          await doRepeat(order);
        },
        { confirmText: 'Vaciar y repetir', destructive: true },
      );
      return;
    }
    doRepeat(order);
  };

  const filtered = orders.filter((o) => {
    if (filter === 'entregados') return o.estado.nombre === OrderStatus.ENTREGADO;
    if (filter === 'cancelados')
      return (
        o.estado.nombre === OrderStatus.CANCELADO ||
        o.estado.nombre === OrderStatus.RECHAZADO
      );
    return true;
  });

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
      {loading ? (
        <View style={styles.list}>
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </View>
      ) : (
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
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => router.push(`/(client)/tracking/${item.id}`)}
              onRepeat={
                item.restaurant && item.items?.length ? () => handleRepeat(item) : undefined
              }
              repeating={repeatingId === item.id}
              onRate={
                item.estado.nombre === OrderStatus.ENTREGADO && !reviewedIds.has(item.id)
                  ? () => openRating(item)
                  : undefined
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>
                {error ?? 'Todavía no tienes pedidos.'}
              </Text>
            </View>
          }
        />
      )}

      {rateOrder && (
        <RatingModal
          visible={!!rateOrder}
          restaurantId={rateOrder.restaurantId}
          restaurantName={rateOrder.restaurant?.name}
          orderId={rateOrder.id}
          onClose={() => setRateOrder(null)}
          onSubmitted={handleRated}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
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
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
    filterTextActive: { color: colors.white },
    empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
    emptyText: { color: colors.textSecondary, fontSize: 15, textAlign: 'center' },
  });
