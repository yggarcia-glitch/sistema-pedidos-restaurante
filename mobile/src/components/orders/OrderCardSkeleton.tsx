import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/src/constants/colors';
import { Skeleton } from '@/src/components/ui/Skeleton';

export function OrderCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Skeleton width="55%" height={16} />
        <Skeleton width={64} height={20} borderRadius={999} />
      </View>
      <Skeleton width="35%" height={12} style={{ marginTop: 8 }} />
      <Skeleton width="25%" height={16} style={{ marginTop: 14 }} />
    </View>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
});
