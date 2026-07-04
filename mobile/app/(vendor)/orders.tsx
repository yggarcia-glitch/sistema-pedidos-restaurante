import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/src/constants/colors';
import { money } from '@/src/constants/status';
import { Order, OrderStatus } from '@/src/types';
import { ordersApi } from '@/src/api/orders.api';
import { getApiError } from '@/src/api/axios';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { CategoryTabs } from '@/src/components/restaurants/CategoryTabs';
import { Spinner } from '@/src/components/ui/Spinner';

type Tab = 'pendientes' | 'preparando' | 'listos';

const TAB_STATUSES: Record<Tab, OrderStatus[]> = {
  pendientes: [OrderStatus.PENDIENTE, OrderStatus.CONFIRMADO],
  preparando: [OrderStatus.EN_PREPARACION],
  listos: [OrderStatus.LISTO, OrderStatus.EN_CAMINO],
};

export default function VendorOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<Tab>('pendientes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await ordersApi.findAll({ limit: 100 });
      setOrders(data.data);
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling cada 15s para detectar pedidos nuevos; se limpia al desmontar.
  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  const changeStatus = async (id: string, status: OrderStatus) => {
    try {
      const { data } = await ordersApi.updateStatus(id, { status });
      setOrders((prev) => prev.map((o) => (o.id === id ? data : o)));
    } catch (e) {
      setError(getApiError(e));
    }
  };

  if (loading) return <Spinner text="Cargando pedidos…" />;

  const filtered = orders.filter((o) => TAB_STATUSES[tab].includes(o.status));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Pedidos</Text>
      <CategoryTabs
        includeAll={false}
        activeId={tab}
        onSelect={(id) => setTab((id as Tab) ?? 'pendientes')}
        items={[
          { id: 'pendientes', name: 'Pendientes' },
          { id: 'preparando', name: 'Preparando' },
          { id: 'listos', name: 'Listos' },
        ]}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No hay pedidos en esta categoría.</Text>
        ) : (
          filtered.map((o) => (
            <Card key={o.id} style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.orderId}>#{o.id.slice(0, 8).toUpperCase()}</Text>
                <Text style={styles.total}>{money(o.total)}</Text>
              </View>
              {o.items?.map((it) => (
                <Text key={it.id} style={styles.item}>
                  {it.quantity}× {it.productName}
                </Text>
              ))}
              <View style={styles.actions}>{renderActions(o, changeStatus)}</View>
            </Card>
          ))
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// Botones de acción según el estado actual del pedido.
function renderActions(
  order: Order,
  change: (id: string, status: OrderStatus) => void,
) {
  switch (order.status) {
    case OrderStatus.PENDIENTE:
      return (
        <>
          <Button
            title="Aceptar"
            onPress={() => change(order.id, OrderStatus.CONFIRMADO)}
            style={styles.flexBtn}
          />
          <Button
            title="Rechazar"
            variant="danger"
            onPress={() => change(order.id, OrderStatus.RECHAZADO)}
            style={styles.flexBtn}
          />
        </>
      );
    case OrderStatus.CONFIRMADO:
      return (
        <Button
          title="En preparación"
          onPress={() => change(order.id, OrderStatus.EN_PREPARACION)}
          fullWidth
        />
      );
    case OrderStatus.EN_PREPARACION:
      return (
        <Button
          title="Marcar listo"
          onPress={() => change(order.id, OrderStatus.LISTO)}
          fullWidth
        />
      );
    case OrderStatus.LISTO:
      return (
        <Button
          title="En camino"
          onPress={() => change(order.id, OrderStatus.EN_CAMINO)}
          fullWidth
        />
      );
    case OrderStatus.EN_CAMINO:
      return (
        <Button
          title="Marcar entregado"
          onPress={() => change(order.id, OrderStatus.ENTREGADO)}
          fullWidth
        />
      );
    default:
      return null;
  }
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
  content: { padding: 16 },
  card: { marginBottom: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: { fontWeight: '800', color: Colors.text, fontSize: 15 },
  total: { fontWeight: '800', color: Colors.primary, fontSize: 15 },
  item: { color: Colors.textSecondary, fontSize: 14, paddingVertical: 2 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  flexBtn: { flex: 1 },
  empty: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: 40 },
  errorText: { color: Colors.dangerText, marginTop: 12 },
});
