import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
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
import { Order, OrderStatus } from '@/src/types';
import { ordersApi } from '@/src/api/orders.api';
import { getApiError } from '@/src/api/axios';
import { confirmAction, notify } from '@/src/utils/dialog';
import { Spinner } from '@/src/components/ui/Spinner';
import { Button } from '@/src/components/ui/Button';
import { OrderStatusStepper } from '@/src/components/orders/OrderStatusStepper';

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
      // Error silencioso durante el polling; se muestra si aún no hay datos.
      if (!order) notify('Error', getApiError(e));
    } finally {
      setLoading(false);
    }
  }, [orderId, order]);

  // Polling cada 10 segundos para reflejar cambios de estado del pedido.
  // Se limpia el intervalo al desmontar (cleanup del useEffect).
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
        <View style={styles.card}>
          <OrderStatusStepper status={order.status} />
        </View>

        <View style={styles.card}>
          <Text style={styles.restaurant}>{order.restaurant?.name ?? 'Restaurante'}</Text>
          <Text style={styles.meta}>
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </Text>
          {order.estimatedTime ? (
            <Text style={styles.meta}>Tiempo estimado: {order.estimatedTime} min</Text>
          ) : null}

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

        {order.status === OrderStatus.PENDIENTE && (
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  restaurant: { fontSize: 18, fontWeight: '800', color: Colors.text },
  meta: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 8 },
  itemQty: { fontWeight: '700', color: Colors.primary },
  itemName: { flex: 1, color: Colors.text },
  itemPrice: { color: Colors.textSecondary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontWeight: '800', fontSize: 17, color: Colors.text },
  totalValue: { fontWeight: '800', fontSize: 17, color: Colors.text },
});
