import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/src/constants/colors';
import { money } from '@/src/constants/status';
import { Order, OrderStatus } from '@/src/types';
import { ordersApi } from '@/src/api/orders.api';
import { getApiError } from '@/src/api/axios';
import { confirmAction, notify } from '@/src/utils/dialog';
import { Spinner } from '@/src/components/ui/Spinner';
import { Button } from '@/src/components/ui/Button';
import { OrderStatusStepper } from '@/src/components/orders/OrderStatusStepper';
import { CourierMap } from '@/src/components/orders/CourierMap';

const TITLES: Record<string, { title: string; emoji: string }> = {
  PENDIENTE: { title: 'Confirmando tu pedido', emoji: '🧾' },
  CONFIRMADO: { title: 'Pedido confirmado', emoji: '✅' },
  EN_PREPARACION: { title: 'Preparando tu pedido', emoji: '👨‍🍳' },
  LISTO: { title: 'Tu pedido está listo', emoji: '📦' },
  EN_CAMINO: { title: 'Tu pedido va en camino', emoji: '🛵' },
  ENTREGADO: { title: '¡Pedido entregado!', emoji: '🎉' },
  CANCELADO: { title: 'Pedido cancelado', emoji: '❌' },
  RECHAZADO: { title: 'Pedido rechazado', emoji: '❌' },
};

export default function TrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await ordersApi.findOne(orderId);
      setOrder(data);
    } catch (e) {
      if (!order) notify('Error', getApiError(e));
    } finally {
      setLoading(false);
    }
  }, [orderId, order]);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleCancel = () => {
    confirmAction(
      'Cancelar pedido',
      '¿Seguro que deseas cancelar este pedido?',
      async () => {
        setCancelling(true);
        try {
          const { data } = await ordersApi.cancel(orderId);
          setOrder(data);
        } catch (e) {
          notify('Error', getApiError(e));
        } finally {
          setCancelling(false);
        }
      },
      { confirmText: 'Sí, cancelar', cancelText: 'No', destructive: true },
    );
  };

  if (loading) return <Spinner text="Cargando pedido…" />;
  if (!order) return null;

  const status = order.estado.nombre;
  const meta = TITLES[status] ?? { title: 'Seguimiento', emoji: '📦' };
  const isCancelled = status === OrderStatus.CANCELADO || status === OrderStatus.RECHAZADO;
  const isMoving = status === OrderStatus.EN_CAMINO;
  const eta = order.estimatedTime ? `${order.estimatedTime} min` : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace('/(client)/history')} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Seguimiento</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero de estado */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{meta.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>{meta.title}</Text>
            <Text style={styles.heroMeta}>
              Pedido #{order.id.slice(0, 8).toUpperCase()}
              {eta && !isCancelled ? ` · ${eta}` : ''}
            </Text>
          </View>
        </View>

        {/* Mapa del repartidor */}
        {!isCancelled && <CourierMap eta={eta} moving={isMoving} />}

        {/* Stepper */}
        <View style={styles.card}>
          <OrderStatusStepper status={status} />
        </View>

        {/* Repartidor (cuando va en camino) */}
        {isMoving && (
          <View style={[styles.card, styles.courierCard]}>
            <View style={styles.courierAvatar}>
              <Text style={styles.courierInitials}>CM</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.courierName}>Carlos Morales</Text>
              <Text style={styles.courierRole}>Repartidor · ★ 4.8</Text>
            </View>
            <TouchableOpacity style={styles.courierAction}>
              <Ionicons name="call" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.courierAction}>
              <Ionicons name="chatbubble-ellipses" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Detalle del pedido */}
        <View style={styles.card}>
          <Text style={styles.restaurant}>{order.restaurant?.name ?? 'Restaurante'}</Text>
          <View style={styles.divider} />
          {order.items?.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <Text style={styles.itemQty}>{it.quantity}×</Text>
              <Text style={styles.itemName}>{it.productName}</Text>
              <Text style={styles.itemPrice}>{money(it.subtotal)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{money(order.total)}</Text>
          </View>
        </View>

        {status === OrderStatus.PENDIENTE && (
          <Button
            title="Cancelar pedido"
            variant="danger"
            fullWidth
            loading={cancelling}
            onPress={handleCancel}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  content: { padding: 16, gap: 16 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.card,
    padding: 16,
  },
  heroEmoji: { fontSize: 34 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: Colors.primaryDark },
  heroMeta: { fontSize: 13, color: Colors.primaryDark, opacity: 0.8, marginTop: 2 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  courierCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  courierAvatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courierInitials: { color: Colors.primaryDark, fontWeight: '800', fontSize: 15 },
  courierName: { fontSize: 15, fontWeight: '800', color: Colors.text },
  courierRole: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  courierAction: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurant: { fontSize: 16, fontWeight: '800', color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 8 },
  itemQty: { fontWeight: '700', color: Colors.primary },
  itemName: { flex: 1, color: Colors.text },
  itemPrice: { color: Colors.textSecondary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontWeight: '800', fontSize: 17, color: Colors.text },
  totalValue: { fontWeight: '800', fontSize: 17, color: Colors.primary },
});
