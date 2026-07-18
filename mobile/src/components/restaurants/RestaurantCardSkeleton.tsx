import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Radius, Shadow } from '@/src/constants/colors';
import { Skeleton } from '@/src/components/ui/Skeleton';

export function RestaurantCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={140} borderRadius={0} />
      <View style={styles.body}>
        <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="45%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
    ...Shadow.card,
  },
  body: { padding: 12 },
});
