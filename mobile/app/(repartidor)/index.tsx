import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/src/constants/colors';
import { money } from '@/src/constants/status';
import { DriverOrderStatus, Order, OrderStatus } from '@/src/types';
import { driversApi } from '@/src/api/drivers.api';
import { ordersApi } from '@/src/api/orders.api';
import { getApiError } from '@/src/api/axios';
import { confirmAction, notify } from '@/src/utils/dialog';
import { Coords, haversineDistanceKm } from '@/src/utils/geo';
import { Spinner } from '@/src/components/ui/Spinner';
import { Button } from '@/src/components/ui/Button';
import { DeliveryMap } from '@/src/components/drivers/DeliveryMap';
import { DriverSheet } from '@/src/components/drivers/DriverSheet';

const shortId = (id: string) => id.slice(0, 8).toUpperCase();

export default function RepartidorHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [driverCoords, setDriverCoords] = useState<Coords | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [earnings, setEarnings] = useState<{ total: number; count: number } | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Carga inicial ──────────────────────────────────────────────────────────
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

  // ── Polling del pedido activo ────────────────────────────────────────────────
  const pollCurrentOrder = useCallback(async () => {
    try {
      const { data } = await driversApi.getCurrentOrder();
      setCurrentOrder(data);
    } catch {
      // silencioso
    }
  }, []);

  useEffect(() => {
    pollRef.current = setInterval(pollCurrentOrder, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pollCurrentOrder]);

  // ── Loop de ubicación (solo disponible) ──────────────────────────────────────
  const pingLocation = useCallback(async () => {
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setDriverCoords(coords);
      await driversApi.updateLocation(coords.lat, coords.lng);
    } catch {
      // sin ubicación este ciclo
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

  // ── Acciones ─────────────────────────────────────────────────────────────────
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

  // Confirmaciones que muestran el ID del pedido.
  const confirmAndRun = (
    title: string,
    verb: string,
    order: Order,
    action: () => Promise<{ data: Order }>,
  ) => {
    confirmAction(title, `${verb}\n\nPedido #${shortId(order.id)}`, () => runAction(action), {
      confirmText: 'Confirmar',
      destructive: title.toLowerCase().includes('rechaz'),
    });
  };

  const loadEarnings = useCallback(async () => {
    try {
      const { data } = await ordersApi.findAll({ limit: 100 });
      const delivered = data.data.filter((o) => o.estado?.nombre === OrderStatus.ENTREGADO);
      const total = delivered.reduce((s, o) => s + Number(o.deliveryFee ?? 0), 0);
      setEarnings({ total, count: delivered.length });
    } catch {
      setEarnings({ total: 0, count: 0 });
    }
  }, []);

  const openMenu = () => {
    setMenuOpen(true);
    loadEarnings();
  };

  if (loading) return <Spinner text="Cargando…" />;

  // ── Coordenadas para el mapa ─────────────────────────────────────────────────
  const restaurantCoords: Coords | null = currentOrder?.restaurant?.latitude != null
    ? { lat: currentOrder.restaurant.latitude, lng: currentOrder.restaurant.longitude }
    : null;
  const clientCoords: Coords | null = currentOrder?.client?.homeLat != null
    ? { lat: currentOrder.client.homeLat, lng: currentOrder.client.homeLng! }
    : null;

  const ds = currentOrder?.driverStatus;
  // Destino actual: al restaurante (ACEPTADO) o al cliente (RETIRADO).
  const goingToClient = ds === DriverOrderStatus.RETIRADO;
  const target: Coords | null = goingToClient ? clientCoords : restaurantCoords;
  const targetLabel = goingToClient ? 'Cliente' : 'Restaurante';
  const distanceKm = driverCoords && target ? haversineDistanceKm(driverCoords, target) : null;

  const navigateTo = (coords: Coords | null) => {
    if (!coords) return;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`);
  };
  const call = (phone?: string | null) => phone && Linking.openURL(`tel:${phone}`);

  return (
    <View style={styles.root}>
      {/* Mapa a pantalla completa (capa base) */}
      <DeliveryMap
        driver={driverCoords}
        destination={target}
        destinationLabel={targetLabel}
        restaurant={goingToClient ? restaurantCoords : null}
      />

      {/* Burbujas superiores */}
      <View style={[styles.topBar, { top: insets.top + 10 }]}>
        <TouchableOpacity style={styles.bubble} onPress={openMenu} activeOpacity={0.85}>
          <Ionicons name="menu" size={22} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.availBubble}
          onPress={() => handleToggleAvailability(!isAvailable)}
          disabled={togglingAvailability}
          activeOpacity={0.85}
        >
          <View style={[styles.dot, { backgroundColor: isAvailable ? '#2FBF71' : Colors.textTertiary }]} />
          <Text style={styles.availText}>{isAvailable ? 'En línea' : 'Desconectado'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Bottom sheet según estado ──────────────────────────────────────────── */}
      {!currentOrder && (
        <DriverSheet key="idle" collapsedHeight={160} expandedHeight={160} draggable={false}>
          {() => (
            <View style={styles.searchWrap}>
              <View style={styles.searchRow}>
                <Ionicons
                  name={isAvailable ? 'radio-outline' : 'moon-outline'}
                  size={22}
                  color={isAvailable ? Colors.primary : Colors.textTertiary}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.searchTitle}>
                    {isAvailable ? 'Buscando pedidos…' : 'Estás desconectado'}
                  </Text>
                  <Text style={styles.searchSub}>
                    {isAvailable
                      ? 'Te asignaremos el pedido más cercano.'
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
            </View>
          )}
        </DriverSheet>
      )}

      {/* Nuevo pedido: aceptar / rechazar */}
      {currentOrder && ds === DriverOrderStatus.ASIGNADO && (
        <DriverSheet key="assigned" collapsedHeight={300} expandedHeight={300} draggable={false}>
          {() => (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.newOrderBanner}>
                <Ionicons name="notifications" size={18} color={Colors.primary} />
                <Text style={styles.newOrderTitle}>¡Nuevo pedido!</Text>
                <Text style={styles.orderId}>#{shortId(currentOrder.id)}</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.placeName}>{currentOrder.restaurant?.name}</Text>
                <Text style={styles.pay}>{money(currentOrder.total)}</Text>
              </View>
              <Text style={styles.meta}>{currentOrder.items?.length ?? 0} producto(s)</Text>
              {distanceKm != null && (
                <Text style={styles.meta}>A ~{distanceKm.toFixed(2)} km del restaurante</Text>
              )}
              <View style={styles.actionsRow}>
                <Button
                  title="Rechazar"
                  variant="outline"
                  loading={actionLoading}
                  style={styles.flex1}
                  onPress={() =>
                    confirmAndRun('Rechazar pedido', '¿Rechazar este pedido?', currentOrder, () =>
                      ordersApi.rejectDriver(currentOrder.id),
                    )
                  }
                />
                <Button
                  title="Aceptar"
                  loading={actionLoading}
                  style={styles.flex1}
                  onPress={() =>
                    confirmAndRun('Aceptar pedido', '¿Aceptar este pedido?', currentOrder, () =>
                      ordersApi.acceptDriver(currentOrder.id),
                    )
                  }
                />
              </View>
            </ScrollView>
          )}
        </DriverSheet>
      )}

      {/* Pedido activo: en ruta al restaurante o al cliente */}
      {currentOrder && (ds === DriverOrderStatus.ACEPTADO || ds === DriverOrderStatus.RETIRADO) && (
        <DriverSheet key={`active-${ds}`} collapsedHeight={188} expandedHeight={Math.round(height * 0.6)}>
          {(expanded) => {
            const contactName = goingToClient
              ? currentOrder.client?.name ?? 'Cliente'
              : currentOrder.restaurant?.name ?? 'Restaurante';
            const contactPhone = goingToClient
              ? currentOrder.client?.phone
              : currentOrder.restaurant?.phone;
            const primaryTitle = goingToClient ? 'Entregar pedido' : 'Retiré el pedido';
            const primaryAction = goingToClient
              ? () => ordersApi.deliver(currentOrder.id)
              : () => ordersApi.pickup(currentOrder.id);

            return (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.rowBetween}>
                  <Text style={styles.stepLabel}>
                    {goingToClient ? 'Lleva el pedido al cliente' : 'Dirígete al restaurante'}
                  </Text>
                  <Text style={styles.orderId}>#{shortId(currentOrder.id)}</Text>
                </View>

                <Text style={styles.contactName}>{contactName}</Text>
                {distanceKm != null && (
                  <Text style={styles.meta}>A ~{distanceKm.toFixed(2)} km</Text>
                )}

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.iconBtn, !contactPhone && styles.iconBtnDisabled]}
                    disabled={!contactPhone}
                    onPress={() => call(contactPhone)}
                  >
                    <Ionicons name="call" size={18} color={Colors.primary} />
                    <Text style={styles.iconBtnText}>Llamar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => navigateTo(target)}>
                    <Ionicons name="navigate" size={18} color={Colors.primary} />
                    <Text style={styles.iconBtnText}>Navegar</Text>
                  </TouchableOpacity>
                </View>

                {/* Detalle (visible al subir el sheet) */}
                {expanded && (
                  <View style={styles.detail}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.detailLabel}>Total a cobrar</Text>
                      <Text style={styles.pay}>{money(currentOrder.total)}</Text>
                    </View>
                    <View style={styles.divider} />
                    {currentOrder.items?.map((it) => (
                      <View key={it.id} style={styles.itemRow}>
                        <Text style={styles.itemQty}>{it.quantity}×</Text>
                        <Text style={styles.itemName}>{it.productName}</Text>
                        <Text style={styles.meta}>{money(it.subtotal)}</Text>
                      </View>
                    ))}
                    <View style={styles.divider} />
                    <Text style={styles.meta}>Pedido #{shortId(currentOrder.id)}</Text>
                    <Text style={styles.meta}>Restaurante: {currentOrder.restaurant?.name}</Text>
                  </View>
                )}

                <Button
                  title={primaryTitle}
                  fullWidth
                  loading={actionLoading}
                  style={{ marginTop: 14 }}
                  onPress={() =>
                    confirmAndRun(primaryTitle, `¿${primaryTitle}?`, currentOrder, primaryAction)
                  }
                />
                {!expanded && (
                  <Text style={styles.hint}>Desliza hacia arriba para ver el detalle</Text>
                )}
              </ScrollView>
            );
          }}
        </DriverSheet>
      )}

      {/* ── Menú de acciones ────────────────────────────────────────────────────── */}
      <Modal visible={menuOpen} transparent animationType="slide" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setMenuOpen(false)}>
          <Pressable style={[styles.modalCard, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Acciones</Text>

            {/* Disponibilidad */}
            <View style={styles.menuRow}>
              <View style={styles.menuIcon}>
                <Ionicons name="power" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>Disponibilidad</Text>
                <Text style={styles.meta}>{isAvailable ? 'En línea' : 'Desconectado'}</Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={handleToggleAvailability}
                disabled={togglingAvailability}
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            {/* Ganancias */}
            <View style={styles.menuRow}>
              <View style={styles.menuIcon}>
                <Ionicons name="cash-outline" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>Ganancias</Text>
                <Text style={styles.meta}>
                  {earnings ? `${earnings.count} entregas` : 'Cargando…'}
                </Text>
              </View>
              <Text style={styles.pay}>{earnings ? money(earnings.total) : '—'}</Text>
            </View>

            {/* Perfil */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                setMenuOpen(false);
                router.push('/(repartidor)/profile');
              }}
            >
              <View style={styles.menuIcon}>
                <Ionicons name="person-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={[styles.menuLabel, { flex: 1 }]}>Mi perfil</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  bubble: {
    width: 46,
    height: 46,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
    shadowOpacity: 0.15,
  },
  availBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: Radius.pill,
    ...Shadow.card,
    shadowOpacity: 0.15,
  },
  dot: { width: 10, height: 10, borderRadius: Radius.pill },
  availText: { fontSize: 13, fontWeight: '800', color: Colors.text },

  // Buscando pedidos
  searchWrap: { flex: 1, justifyContent: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  searchTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },
  searchSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  // Nuevo pedido
  newOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.card,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  newOrderTitle: { fontSize: 15, fontWeight: '800', color: Colors.primaryDark, flex: 1 },
  orderId: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  placeName: { fontSize: 17, fontWeight: '800', color: Colors.text },
  stepLabel: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  contactName: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 4 },
  pay: { fontSize: 17, fontWeight: '800', color: Colors.primary },
  meta: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  flex1: { flex: 1 },
  iconBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  iconBtnDisabled: { opacity: 0.45 },
  iconBtnText: { fontSize: 14, fontWeight: '800', color: Colors.primary },

  detail: { marginTop: 14 },
  detailLabel: { fontSize: 15, fontWeight: '800', color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  itemQty: { fontWeight: '800', color: Colors.primary },
  itemName: { flex: 1, color: Colors.text },
  hint: { textAlign: 'center', fontSize: 12, color: Colors.textTertiary, marginTop: 10 },

  // Modal de acciones
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.border,
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: '700', color: Colors.text },
});
