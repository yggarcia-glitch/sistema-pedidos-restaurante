import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { ORDER_FLOW, ORDER_STATUS_META, statusMeta } from '@/src/constants/status';
import { OrderStatus } from '@/src/types';

interface Props {
  // Nombre del estado (la API lo envía como objeto { id, nombre }).
  status: string;
}

// Stepper horizontal de los 6 estados del flujo feliz.
// El estado actual y los previos se resaltan en naranja.
export function OrderStatusStepper({ status }: Props) {
  // Estados terminales fuera del flujo feliz.
  const isCancelled =
    status === OrderStatus.CANCELADO || status === OrderStatus.RECHAZADO;

  if (isCancelled) {
    return (
      <View style={styles.cancelledBox}>
        <Ionicons name="close-circle" size={22} color={Colors.dangerText} />
        <Text style={styles.cancelledText}>
          Pedido {statusMeta(status).label.toLowerCase()}
        </Text>
      </View>
    );
  }

  const currentIndex = ORDER_FLOW.indexOf(status as OrderStatus);

  return (
    <View style={styles.row}>
      {ORDER_FLOW.map((s, i) => {
        const reached = i <= currentIndex;
        return (
          <React.Fragment key={s}>
            <View style={styles.step}>
              <View style={[styles.dot, reached && styles.dotActive]}>
                {reached ? (
                  <Ionicons name="checkmark" size={14} color={Colors.white} />
                ) : (
                  <Text style={styles.dotNum}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.label, reached && styles.labelActive]} numberOfLines={1}>
                {ORDER_STATUS_META[s].label}
              </Text>
            </View>
            {i < ORDER_FLOW.length - 1 && (
              <View style={[styles.line, i < currentIndex && styles.lineActive]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8 },
  step: { alignItems: 'center', width: 52 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { backgroundColor: Colors.primary },
  dotNum: { fontSize: 12, color: Colors.textSecondary, fontWeight: '700' },
  label: { fontSize: 10, color: Colors.textTertiary, marginTop: 4, textAlign: 'center' },
  labelActive: { color: Colors.primary, fontWeight: '700' },
  line: { flex: 1, height: 2, backgroundColor: Colors.border, marginTop: 13 },
  lineActive: { backgroundColor: Colors.primary },
  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.danger,
    padding: 12,
    borderRadius: 8,
  },
  cancelledText: { color: Colors.dangerText, fontWeight: '700', fontSize: 15 },
});
