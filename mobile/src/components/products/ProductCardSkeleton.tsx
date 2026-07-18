import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Radius } from '@/src/constants/colors';
import { Skeleton } from '@/src/components/ui/Skeleton';

export function ProductCardSkeleton() {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Skeleton width="60%" height={15} style={{ marginBottom: 8 }} />
        <Skeleton width="90%" height={12} style={{ marginBottom: 10 }} />
        <Skeleton width={60} height={15} />
      </View>
      <Skeleton width={88} height={88} borderRadius={Radius.card} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  info: { flex: 1, paddingRight: 12 },
});
