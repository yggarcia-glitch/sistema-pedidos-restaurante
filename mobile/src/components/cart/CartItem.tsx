import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/src/constants/colors';
import { money } from '@/src/constants/status';
import { CartItem as CartItemType } from '@/src/types';

interface Props {
  item: CartItemType;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export function CartItem({ item, onIncrease, onDecrease, onRemove }: Props) {
  const lineTotal = Number(item.unitPrice) * item.quantity;
  const choiceNames = item.choices
    ?.map((c) => c.choice?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.product?.name ?? 'Producto'}
        </Text>
        {choiceNames ? (
          <Text style={styles.choices} numberOfLines={1}>
            {choiceNames}
          </Text>
        ) : null}
        <Text style={styles.price}>{money(lineTotal)}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.qtyBtn} onPress={onDecrease}>
          <Ionicons name="remove" size={18} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.qty}>{item.quantity}</Text>
        <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease}>
          <Ionicons name="add" size={18} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onRemove} hitSlop={8} style={styles.trash}>
          <Ionicons name="trash-outline" size={20} color={Colors.dangerText} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
    ...Shadow.card,
  },
  info: { flex: 1, paddingRight: 8 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.text },
  choices: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700', color: Colors.primary, marginTop: 6 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { fontSize: 15, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  trash: { marginLeft: 6 },
});
