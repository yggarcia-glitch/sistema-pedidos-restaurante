import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/src/constants/colors';

interface Props {
  step: number; // 1-based
  total: number;
  labels: string[];
}

// Barra de progreso simple para flujos cortos (carrito -> pago), inspirada en
// el checkout de 3 pasos de Uber Eats pero recortada a lo que RestauMap
// realmente tiene: 2 pasos.
export function ProgressSteps({ step, total, labels }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[styles.segment, i < step && styles.segmentActive]}
          />
        ))}
      </View>
      <Text style={styles.label}>
        Paso {step} de {total} · {labels[step - 1]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 4 },
  track: { flexDirection: 'row', gap: 6 },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: Colors.border,
  },
  segmentActive: { backgroundColor: Colors.primary },
  label: { fontSize: 12, color: Colors.textSecondary, marginTop: 6, fontWeight: '600' },
});
