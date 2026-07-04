import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { money } from '@/src/constants/status';
import { Restaurant } from '@/src/types';

interface Props {
  restaurant: Restaurant;
  onPress: () => void;
}

export function RestaurantCard({ restaurant, onPress }: Props) {
  const r = restaurant;
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <Image
        source={{
          uri:
            r.coverUrl ??
            `https://placehold.co/600x300/E85D26/FFFFFF/png?text=${encodeURIComponent(r.name)}`,
        }}
        style={styles.cover}
      />
      {!r.isOpen && (
        <View style={styles.closedOverlay}>
          <Text style={styles.closedText}>Cerrado</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {r.name}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={14} color="#F5A623" />
          <Text style={styles.metaText}>
            {r.rating.toFixed(1)} ({r.totalReviews})
          </Text>
          <Text style={styles.dot}>·</Text>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{r.deliveryTime ?? 30} min</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="bicycle-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>Envío {money(r.deliveryFee)}</Text>
          {typeof r.distanceKm === 'number' && (
            <>
              <Text style={styles.dot}>·</Text>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{r.distanceKm.toFixed(1)} km</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  cover: { width: '100%', height: 140, backgroundColor: Colors.border },
  closedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  body: { padding: 12 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  metaText: { fontSize: 13, color: Colors.textSecondary, marginLeft: 4 },
  dot: { marginHorizontal: 6, color: Colors.textTertiary },
});
