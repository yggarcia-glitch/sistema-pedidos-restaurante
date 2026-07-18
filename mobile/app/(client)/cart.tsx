import React, { useMemo, useState } from 'react';
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
import { money } from '@/src/constants/status';
import { DeliveryType } from '@/src/types';
import { useCart } from '@/src/hooks/useCart';
import { useClientTheme } from '@/src/theme/ClientThemeContext';
import { Palette } from '@/src/theme/ClientThemeContext';
import { CartItem } from '@/src/components/cart/CartItem';
import { Button } from '@/src/components/ui/Button';
import { ProgressSteps } from '@/src/components/ui/ProgressSteps';

export default function CartScreen() {
  const router = useRouter();
  const { colors } = useClientTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { cart, subtotal, itemCount, updateItem, removeItem } = useCart();
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(DeliveryType.DELIVERY);
  const [notes, setNotes] = useState('');

  const deliveryFee =
    deliveryType === DeliveryType.DELIVERY
      ? Number(cart?.restaurant?.deliveryFee ?? 0)
      : 0;
  const total = subtotal + deliveryFee;

  const ToggleOption = ({
    icon,
    label,
    active,
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.toggle, active && styles.toggleActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={20} color={active ? colors.primary : colors.textSecondary} />
      <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.bold]}>{value}</Text>
    </View>
  );

  if (!cart || itemCount === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.header}>Carrito</Text>
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={56} color={colors.textTertiary} />
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
          <Button title="Explorar restaurantes" onPress={() => router.push('/(client)')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.header}>Carrito</Text>
      <View style={styles.progressWrap}>
        <ProgressSteps step={1} total={2} labels={['Tu pedido', 'Pago']} />
      </View>
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
          placeholderTextColor={colors.textTertiary}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {/* Desglose */}
        <View style={styles.summary}>
          <Row label="Subtotal" value={money(subtotal)} />
          <Row label="Envío" value={money(deliveryFee)} />
          <Row label="Total" value={money(total)} bold />
          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.trustText}>Sin cargos ocultos</Text>
          </View>
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

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    progressWrap: { paddingHorizontal: 16, paddingBottom: 10 },
    content: { padding: 16, paddingTop: 0 },
    restaurant: { fontSize: 15, fontWeight: '700', color: colors.primary, marginBottom: 12 },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
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
      borderColor: colors.border,
      backgroundColor: colors.white,
    },
    toggleActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
    toggleText: { fontWeight: '700', color: colors.textSecondary },
    toggleTextActive: { color: colors.primary },
    notes: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      minHeight: 70,
      textAlignVertical: 'top',
      color: colors.text,
    },
    summary: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 16,
      marginTop: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    summaryLabel: { color: colors.textSecondary, fontSize: 15 },
    summaryValue: { color: colors.text, fontSize: 15 },
    bold: { fontWeight: '800', fontSize: 17, color: colors.text },
    trustRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    trustText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.white,
    },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
    emptyText: { fontSize: 16, color: colors.textSecondary },
  });
