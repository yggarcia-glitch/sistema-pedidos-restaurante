import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/src/constants/colors';
import { money } from '@/src/constants/status';
import { DriverOrderStatus, Order } from '@/src/types';
import { driversApi } from '@/src/api/drivers.api';
import { ordersApi } from '@/src/api/orders.api';
import { getApiError } from '@/src/api/axios';
import { notify } from '@/src/utils/dialog';
import { Coords, haversineDistanceKm } from '@/src/utils/geo';
import { Spinner } from '@/src/components/ui/Spinner';
import { Button } from '@/src/components/ui/Button';
import { DriverRouteMap } from '@/src/components/drivers/DriverRouteMap';

const ARRIVAL_THRESHOLD_KM = 0.15; // 150 m

export default function RepartidorHomeScreen() {
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [driverCoords, setDriverCoords] = useState<Coords | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Carga inicial: perfil (disponibilidad) + pedido activo si lo hay.
  useEffect(() => {
    (async () => {
      try {
        const [{ data: profile }, { data: order }] = await Promise.all([
          driversApi.getMe(),
          driversApi.getCurrentOrder(),
        ]);
        setIsAvailable(profile.isAvailable);
        setCurrentOrder(order);
      } catch (e) {
        notify('Error', getApiError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Polling del pedido activo: se siente "automático" sin recargar la pantalla.
  const pollCurrentOrder = useCallback(async () => {
    try {
      const { data } = await driversApi.getCurrentOrder();
      setCurrentOrder(data);
    } catch {
      // Silencioso: el polling no debe interrumpir al repartidor con alertas.
    }
  }, []);

  useEffect(() => {
    pollRef.current = setInterval(pollCurrentOrder, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pollCurrentOrder]);

  // Loop de ubicación: solo mientras está disponible.
  const pingLocation = useCallback(async () => {
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setDriverCoords(coords);
      await driversApi.updateLocation(coords.lat, coords.lng);
    } catch {
      // Sin ubicación disponible en este ciclo; se reintenta en el próximo.
    }
  }, []);

  useEffect(() => {
    if (isAvailable) {
      pingLocation();
      locationRef.current = setInterval(pingLocation, 10000);
    } else if (locationRef.current) {
      clearInterval(locationRef.current);
      locationRef.current = null;
    }
    return () => {
      if (locationRef.current) {
        clearInterval(locationRef.current);
        locationRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailable]);

  const handleToggleAvailability = async (next: boolean) => {
    if (next) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        notify('Permiso requerido', 'Activa el permiso de ubicación para recibir pedidos.');
        return;
      }
    }
    setTogglingAvailability(true);
    try {
      const { data } = await driversApi.setAvailability(next);
      setIsAvailable(data.isAvailable);
      if (next) pollCurrentOrder();
    } catch (e) {
      notify('Error', getApiError(e));
    } finally {
      setTogglingAvailability(false);
    }
  };

  const runAction = async (action: () => Promise<{ data: Order }>) => {
    setActionLoading(true);
    try {
      const { data } = await action();
      setCurrentOrder(data.driverStatus === DriverOrderStatus.ENTREGADO ? null : data);
    } catch (e) {
      notify('Error', getApiError(e));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Spinner text="Cargando…" />;

  // ── Sin pedido activo: pantalla de disponibilidad ──────────────────────────
  if (!currentOrder) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.content}>
          <View style={styles.availabilityCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.availabilityTitle}>
                {isAvailable ? 'Estás disponible' : 'No disponible'}
              </Text>
              <Text style={styles.availabilitySubtitle}>
                {isAvailable
                  ? 'Recibirás pedidos automáticamente cuando estén listos.'
                  : 'Actívate para empezar a recibir pedidos.'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={handleToggleAvailability}
              disabled={togglingAvailability}
              trackColor={{ false: Colors.border, true: Colors.primary }}
            />
          </View>

          <View style={styles.emptyState}>
            <Ionicons
              name={isAvailable ? 'time-outline' : 'moon-outline'}
              size={48}
              color={Colors.textTertiary}
            />
            <Text style={styles.emptyText}>
              {isAvailable ? 'Esperando pedidos…' : 'Estás desconectado'}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const restaurantCoords: Coords | null = currentOrder.restaurant
    ? { lat: currentOrder.restaurant.latitude, lng: currentOrder.restaurant.longitude }
    : null;
  const clientCoords: Coords | null = currentOrder.address
    ? { lat: currentOrder.address.latitude, lng: currentOrder.address.longitude }
    : null;

  // ── ASIGNADO: aceptar / rechazar ────────────────────────────────────────────
  if (currentOrder.driverStatus === DriverOrderStatus.ASIGNADO) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.newOrderBanner}>
            <Ionicons name="notifications" size={22} color={Colors.primary} />
            <Text style={styles.newOrderTitle}>¡Nuevo pedido!</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.restaurantName}>{currentOrder.restaurant?.name}</Text>
            <Text style={styles.meta}>{currentOrder.items?.length ?? 0} producto(s)</Text>
            <View style={styles.divider} />
            <Text style={styles.address}>{currentOrder.address?.street}</Text>
            <Text style={styles.meta}>{currentOrder.address?.city}</Text>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{money(currentOrder.total)}</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Button
              title="Rechazar"
              variant="outline"
              loading={actionLoading}
              onPress={() => runAction(() => ordersApi.rejectDriver(currentOrder.id))}
              style={styles.actionBtn}
            />
            <Button
              title="Aceptar"
              loading={actionLoading}
              onPress={() => runAction(() => ordersApi.acceptDriver(currentOrder.id))}
              style={styles.actionBtn}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── ACEPTADO: ir al restaurante ──────────────────────────────────────────
  if (currentOrder.driverStatus === DriverOrderStatus.ACEPTADO && restaurantCoords) {
    const distance = driverCoords ? haversineDistanceKm(driverCoords, restaurantCoords) : null;
    const canPickup = distance !== null && distance < ARRIVAL_THRESHOLD_KM;

    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Dirígete al restaurante</Text>
          <DriverRouteMap
            driverCoords={driverCoords ?? restaurantCoords}
            destination={restaurantCoords}
            destinationLabel={currentOrder.restaurant?.name ?? 'Restaurante'}
          />
          <View style={styles.card}>
            <Text style={styles.restaurantName}>{currentOrder.restaurant?.name}</Text>
            <Text style={styles.meta}>Pedido #{currentOrder.id.slice(0, 8).toUpperCase()}</Text>
            {distance !== null && (
              <Text style={styles.meta}>Distancia: {distance.toFixed(2)} km</Text>
            )}
          </View>
          <Button
            title={canPickup ? 'Retiré el pedido' : 'Acércate al restaurante'}
            disabled={!canPickup}
            loading={actionLoading}
            fullWidth
            onPress={() => runAction(() => ordersApi.pickup(currentOrder.id))}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── RETIRADO: ir al cliente ──────────────────────────────────────────────
  if (currentOrder.driverStatus === DriverOrderStatus.RETIRADO && clientCoords) {
    const distance = driverCoords ? haversineDistanceKm(driverCoords, clientCoords) : null;
    const canDeliver = distance !== null && distance < ARRIVAL_THRESHOLD_KM;
    const clientPhone = currentOrder.client?.phone;

    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Dirígete al cliente</Text>
          <DriverRouteMap
            driverCoords={driverCoords ?? clientCoords}
            destination={clientCoords}
            destinationLabel="Cliente"
          />
          <View style={styles.card}>
            <Text style={styles.restaurantName}>{currentOrder.address?.street}</Text>
            <Text style={styles.meta}>{currentOrder.address?.city}</Text>
            {distance !== null && (
              <Text style={styles.meta}>Distancia: {distance.toFixed(2)} km</Text>
            )}
          </View>
          <View style={styles.actionsRow}>
            <Button
              title="Llamar"
              variant="outline"
              disabled={!clientPhone}
              onPress={() => clientPhone && Linking.openURL(`tel:${clientPhone}`)}
              style={styles.actionBtn}
            />
            <Button
              title={canDeliver ? 'Entregar pedido' : 'Acércate al cliente'}
              disabled={!canDeliver}
              loading={actionLoading}
              onPress={() => runAction(() => ordersApi.deliver(currentOrder.id))}
              style={styles.actionBtn}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return <Spinner text="Cargando pedido…" />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 16, flexGrow: 1 },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  availabilityTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },
  availabilitySubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60 },
  emptyText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
  newOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.card,
    padding: 14,
  },
  newOrderTitle: { fontSize: 16, fontWeight: '800', color: Colors.primaryDark },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
    gap: 4,
  },
  restaurantName: { fontSize: 16, fontWeight: '800', color: Colors.text },
  address: { fontSize: 15, fontWeight: '700', color: Colors.text },
  meta: { fontSize: 13, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontWeight: '800', fontSize: 16, color: Colors.text },
  totalValue: { fontWeight: '800', fontSize: 16, color: Colors.primary },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1 },
});
