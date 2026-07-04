import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/src/constants/colors';
import { money, ORDER_STATUS_META } from '@/src/constants/status';
import { Order, OrderStatus } from '@/src/types';
import { ordersApi } from '@/src/api/orders.api';
import { restaurantsApi } from '@/src/api/restaurants.api';
import { getApiError } from '@/src/api/axios';
import { useMyRestaurant } from '@/src/hooks/useMyRestaurant';
import { Spinner } from '@/src/components/ui/Spinner';
import { Badge } from '@/src/components/ui/Badge';
import { Card } from '@/src/components/ui/Card';

export default function VendorDashboard() {
  const { restaurant, loading, reload, setRestaurant } = useMyRestaurant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await ordersApi.findAll({ limit: 100 });
      setOrders(data.data);
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const toggleOpen = async () => {
    if (!restaurant) return;
    try {
      const { data } = await restaurantsApi.toggleOpen(restaurant.id);
      setRestaurant(data);
    } catch (e) {
      setError(getApiError(e));
    }
  };

  if (loading) return <Spinner text="Cargando panel…" />;

  // KPIs derivados de los pedidos.
  const today = new Date().toDateString();
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === today,
  );
  const revenue = todayOrders
    .filter((o) => o.status === OrderStatus.ENTREGADO)
    .reduce((s, o) => s + Number(o.total), 0);
  const preparing = orders.filter(
    (o) => o.status === OrderStatus.EN_PREPARACION,
  ).length;
  const avgTicket = todayOrders.length ? revenue / todayOrders.length : 0;

  const active = orders.filter(
    (o) =>
      ![OrderStatus.ENTREGADO, OrderStatus.CANCELADO, OrderStatus.RECHAZADO].includes(
        o.status,
      ),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              reload();
              loadOrders();
            }}
            tintColor={Colors.primary}
          />
        }
      >
        <Text style={styles.title}>{restaurant?.name ?? 'Mi restaurante'}</Text>

        {restaurant && (
          <Card style={styles.openCard}>
            <View>
              <Text style={styles.openLabel}>Estado del local</Text>
              <Text style={styles.openValue}>
                {restaurant.isOpen ? 'Abierto' : 'Cerrado'}
              </Text>
            </View>
            <Switch
              value={restaurant.isOpen}
              onValueChange={toggleOpen}
              trackColor={{ true: Colors.primary }}
            />
          </Card>
        )}

        {!restaurant && (
          <Text style={styles.warn}>
            Aún no tienes un restaurante registrado. Créalo desde la web para gestionar pedidos.
          </Text>
        )}

        {/* KPIs 2x2 */}
        <View style={styles.grid}>
          <Kpi label="Pedidos hoy" value={String(todayOrders.length)} />
          <Kpi label="Ingresos hoy" value={money(revenue)} />
          <Kpi label="En preparación" value={String(preparing)} />
          <Kpi label="Ticket promedio" value={money(avgTicket)} />
        </View>

        <Text style={styles.sectionTitle}>Pedidos activos</Text>
        {active.length === 0 ? (
          <Text style={styles.empty}>No hay pedidos activos.</Text>
        ) : (
          active.map((o) => {
            const meta = ORDER_STATUS_META[o.status];
            return (
              <Card key={o.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>#{o.id.slice(0, 8).toUpperCase()}</Text>
                  <Badge label={meta.label} type={meta.badge} />
                </View>
                <Text style={styles.orderTotal}>{money(o.total)}</Text>
              </Card>
            );
          })
        )}
        {error ? <Text style={styles.warn}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 16 },
  openCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  openLabel: { fontSize: 13, color: Colors.textSecondary },
  openValue: { fontSize: 18, fontWeight: '800', color: Colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpi: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  kpiValue: { fontSize: 24, fontWeight: '800', color: Colors.primary },
  kpiLabel: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  orderCard: { marginBottom: 10 },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: { fontWeight: '700', color: Colors.text },
  orderTotal: { fontWeight: '800', color: Colors.text, marginTop: 8, fontSize: 16 },
  empty: { color: Colors.textSecondary, paddingVertical: 12 },
  warn: { color: Colors.dangerText, marginTop: 12 },
});
