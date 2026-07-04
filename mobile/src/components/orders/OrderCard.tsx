import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { money, ORDER_STATUS_META } from '@/src/constants/status';
import { Order } from '@/src/types';
import { Badge } from '@/src/components/ui/Badge';

interface Props {
  order: Order;
  onPress: () => void;
  onRepeat?: () => void;
}

export function OrderCard({ order, onPress, onRepeat }: Props) {
  const meta = ORDER_STATUS_META[order.status];
  const date = new Date(order.createdAt).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {order.restaurant?.name ?? 'Restaurante'}
        </Text>
        <Badge label={meta.label} type={meta.badge} />
      </View>
      <Text style={styles.date}>{date}</Text>
      <View style={styles.footer}>
        <Text style={styles.total}>{money(order.total)}</Text>
        {onRepeat && (
          <TouchableOpacity style={styles.repeatBtn} onPress={onRepeat}>
            <Ionicons name="repeat" size={16} color={Colors.primary} />
            <Text style={styles.repeatText}>Repetir</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  name: { fontSize: 16, fontWeight: '700', color: Colors.text, flex: 1 },
  date: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  total: { fontSize: 16, fontWeight: '800', color: Colors.text },
  repeatBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  repeatText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
});
