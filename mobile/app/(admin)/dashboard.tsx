import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/src/constants/colors';
import { money, ORDER_STATUS_META } from '@/src/constants/status';
import { Order } from '@/src/types';
import { ordersApi } from '@/src/api/orders.api';
import { usersApi } from '@/src/api/users.api';
import { restaurantsApi } from '@/src/api/restaurants.api';
import { getApiError } from '@/src/api/axios';
import { Spinner } from '@/src/components/ui/Spinner';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, users: 0, restaurants: 0 });
  const [recent, setRecent] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [ordersRes, usersRes, restRes] = await Promise.all([
        ordersApi.findAll({ limit: 100 }),
        usersApi.findAll(),
        restaurantsApi.findAll({ limit: 100 }),
      ]);
      const orders = ordersRes.data.data;
      const revenue = orders.reduce((s, o) => s + Number(o.total), 0);
      setStats({
        orders: ordersRes.data.total,
        revenue,
        users: usersRes.data.length,
        restaurants: restRes.data.total,
      });
      setRecent(orders.slice(0, 8));
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) return <Spinner text="Cargando panel…" />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
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
      >
        <Text style={styles.title}>Panel de administración</Text>

        <View style={styles.grid}>
          <Kpi label="Pedidos totales" value={String(stats.orders)} />
          <Kpi label="Ingresos" value={money(stats.revenue)} />
          <Kpi label="Usuarios" value={String(stats.users)} />
          <Kpi label="Restaurantes" value={String(stats.restaurants)} />
        </View>

        <Text style={styles.sectionTitle}>Actividad reciente</Text>
        {recent.length === 0 ? (
          <Text style={styles.empty}>Sin actividad reciente.</Text>
        ) : (
          recent.map((o) => {
            const meta = ORDER_STATUS_META[o.status];
            return (
              <Card key={o.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>
                    {o.restaurant?.name ?? '#' + o.id.slice(0, 8)}
                  </Text>
                  <Badge label={meta.label} type={meta.badge} />
                </View>
                <Text style={styles.orderTotal}>{money(o.total)}</Text>
              </Card>
            );
          })
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  kpiValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
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
  orderId: { fontWeight: '700', color: Colors.text, flex: 1 },
  orderTotal: { fontWeight: '800', color: Colors.text, marginTop: 8, fontSize: 16 },
  empty: { color: Colors.textSecondary, paddingVertical: 12 },
  errorText: { color: Colors.dangerText, marginTop: 12 },
});
