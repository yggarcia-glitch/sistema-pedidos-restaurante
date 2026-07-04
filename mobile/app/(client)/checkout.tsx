import React, { useState } from 'react';
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
import { DeliveryType, PaymentMethod } from '@/src/types';
import { ordersApi } from '@/src/api/orders.api';
import { paymentsApi } from '@/src/api/payments.api';
import { getApiError } from '@/src/api/axios';
import { notify } from '@/src/utils/dialog';
import { useCart } from '@/src/hooks/useCart';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

const METHODS: { value: PaymentMethod; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: PaymentMethod.EFECTIVO, label: 'Efectivo', icon: 'cash-outline' },
  { value: PaymentMethod.TARJETA_CREDITO, label: 'Tarjeta de crédito', icon: 'card-outline' },
  { value: PaymentMethod.TARJETA_DEBITO, label: 'Tarjeta de débito', icon: 'card-outline' },
  { value: PaymentMethod.TRANSFERENCIA, label: 'Transferencia', icon: 'swap-horizontal-outline' },
  { value: PaymentMethod.PAYPAL, label: 'PayPal', icon: 'logo-paypal' },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ deliveryType?: string; notes?: string }>();
  const { cart, subtotal, fetchCart } = useCart();

  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.EFECTIVO);
  const [loading, setLoading] = useState(false);
  // Datos de tarjeta: solo UI, no se procesan realmente.
  const [card, setCard] = useState({ number: '', exp: '', cvv: '' });

  const deliveryType =
    (params.deliveryType as DeliveryType) ?? DeliveryType.DELIVERY;
  const isCard =
    method === PaymentMethod.TARJETA_CREDITO || method === PaymentMethod.TARJETA_DEBITO;
  const deliveryFee =
    deliveryType === DeliveryType.DELIVERY ? Number(cart?.restaurant?.deliveryFee ?? 0) : 0;
  const total = subtotal + deliveryFee;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // 1) Crea el pedido a partir del carrito (backend calcula los totales).
      const { data: order } = await ordersApi.create({
        deliveryType,
        notes: params.notes || undefined,
      });
      // 2) Registra el pago asociado al pedido.
      await paymentsApi.create({ orderId: order.id, method });
      // 3) El carrito quedó consumido: refresca y navega al seguimiento.
      await fetchCart();
      router.replace(`/(client)/tracking/${order.id}`);
    } catch (e) {
      notify('No se pudo confirmar el pedido', getApiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Pagar</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Resumen */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{cart?.restaurant?.name ?? 'Tu pedido'}</Text>
          <Text style={styles.summaryLine}>
            {deliveryType === DeliveryType.DELIVERY ? 'Entrega a domicilio' : 'Retiro en local'}
          </Text>
          <View style={styles.divider} />
          <Row label="Subtotal" value={money(subtotal)} />
          <Row label="Envío" value={money(deliveryFee)} />
          <Row label="Total" value={money(total)} bold />
        </View>

        {/* Método de pago */}
        <Text style={styles.sectionTitle}>Método de pago</Text>
        {METHODS.map((m) => {
          const active = method === m.value;
          return (
            <TouchableOpacity
              key={m.value}
              style={styles.methodRow}
              onPress={() => setMethod(m.value)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={active ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={active ? Colors.primary : Colors.textTertiary}
              />
              <Ionicons name={m.icon} size={20} color={Colors.textSecondary} />
              <Text style={styles.methodLabel}>{m.label}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Datos de tarjeta (solo UI) */}
        {isCard && (
          <View style={styles.cardForm}>
            <Input
              label="Número de tarjeta"
              placeholder="1234 5678 9012 3456"
              keyboardType="number-pad"
              value={card.number}
              onChangeText={(t) => setCard((c) => ({ ...c, number: t }))}
            />
            <View style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Vencimiento"
                  placeholder="MM/AA"
                  value={card.exp}
                  onChangeText={(t) => setCard((c) => ({ ...c, exp: t }))}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="CVV"
                  placeholder="123"
                  keyboardType="number-pad"
                  secureTextEntry
                  value={card.cvv}
                  onChangeText={(t) => setCard((c) => ({ ...c, cvv: t }))}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`Confirmar pedido · ${money(total)}`}
          fullWidth
          loading={loading}
          onPress={handleConfirm}
        />
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
    </View>
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
  content: { padding: 16 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  summaryLine: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { color: Colors.textSecondary, fontSize: 15 },
  rowValue: { color: Colors.text, fontSize: 15 },
  bold: { fontWeight: '800', fontSize: 17, color: Colors.text },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  methodLabel: { fontSize: 15, color: Colors.text, fontWeight: '600' },
  cardForm: { marginTop: 12 },
  cardRow: { flexDirection: 'row', gap: 12 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
});
