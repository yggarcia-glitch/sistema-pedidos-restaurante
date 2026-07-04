import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { money } from '@/src/constants/status';
import { DeliveryType } from '@/src/types';
import { useCart } from '@/src/hooks/useCart';
import { CartItem } from '@/src/components/cart/CartItem';
import { Button } from '@/src/components/ui/Button';

export default function CartScreen() {
  const router = useRouter();
  const { cart, subtotal, itemCount, updateItem, removeItem } = useCart();
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(DeliveryType.DELIVERY);
  const [notes, setNotes] = useState('');

  const deliveryFee =
    deliveryType === DeliveryType.DELIVERY
      ? Number(cart?.restaurant?.deliveryFee ?? 0)
      : 0;
  const total = subtotal + deliveryFee;

  if (!cart || itemCount === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.header}>Carrito</Text>
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={56} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
          <Button title="Explorar restaurantes" onPress={() => router.push('/(client)')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.header}>Carrito</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {cart.restaurant?.name ? (
          <Text style={styles.restaurant}>{cart.restaurant.name}</Text>
        ) : null}

        {cart.items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onIncrease={() => updateItem(item.id, item.quantity + 1)}
            onDecrease={() =>
              item.quantity > 1
                ? updateItem(item.id, item.quantity - 1)
                : removeItem(item.id)
            }
            onRemove={() => removeItem(item.id)}
          />
        ))}

        {/* Tipo de entrega */}
        <Text style={styles.sectionTitle}>Tipo de entrega</Text>
        <View style={styles.toggleRow}>
          <ToggleOption
            icon="bicycle"
            label="Domicilio"
            active={deliveryType === DeliveryType.DELIVERY}
            onPress={() => setDeliveryType(DeliveryType.DELIVERY)}
          />
          <ToggleOption
            icon="walk"
            label="Retiro"
            active={deliveryType === DeliveryType.PICKUP}
            onPress={() => setDeliveryType(DeliveryType.PICKUP)}
          />
        </View>

        {/* Notas */}
        <Text style={styles.sectionTitle}>Notas para el pedido</Text>
        <TextInput
          style={styles.notes}
          placeholder="Ej: sin cebolla, tocar el timbre…"
          placeholderTextColor={Colors.textTertiary}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {/* Desglose */}
        <View style={styles.summary}>
          <Row label="Subtotal" value={money(subtotal)} />
          <Row label="Envío" value={money(deliveryFee)} />
          <Row label="Total" value={money(total)} bold />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`Ir a pagar · ${money(total)}`}
          fullWidth
          onPress={() =>
            router.push({
              pathname: '/(client)/checkout',
              params: { deliveryType, notes },
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}

function ToggleOption({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.toggle, active && styles.toggleActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={20} color={active ? Colors.primary : Colors.textSecondary} />
      <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: { padding: 16, paddingTop: 0 },
  restaurant: { fontSize: 15, fontWeight: '700', color: Colors.primary, marginBottom: 12 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  toggleRow: { flexDirection: 'row', gap: 12 },
  toggle: {
    flex: 1,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  toggleActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  toggleText: { fontWeight: '700', color: Colors.textSecondary },
  toggleTextActive: { color: Colors.primary },
  notes: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    minHeight: 70,
    textAlignVertical: 'top',
    color: Colors.text,
  },
  summary: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: { color: Colors.textSecondary, fontSize: 15 },
  summaryValue: { color: Colors.text, fontSize: 15 },
  bold: { fontWeight: '800', fontSize: 17, color: Colors.text },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
});
