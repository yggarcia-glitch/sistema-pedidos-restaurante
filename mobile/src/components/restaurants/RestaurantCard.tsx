import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/src/constants/colors';
import { money } from '@/src/constants/status';
import { Restaurant } from '@/src/types';
import { priceTier } from '@/src/utils/priceTier';

interface Props {
  restaurant: Restaurant;
  onPress: () => void;
}

export function RestaurantCard({ restaurant, onPress }: Props) {
  const r = restaurant;
  const category = r.categories?.[0]?.name;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View>
        <Image
          source={{
            uri:
              r.coverUrl ??
              `https://placehold.co/600x300/E85D26/FFFFFF/png?text=${encodeURIComponent(r.name)}`,
          }}
          style={styles.cover}
        />
        {/* Pill de rating flotante + nivel de precio */}
        <View style={styles.ratingPill}>
          <Ionicons name="star" size={12} color={Colors.amber} />
          <Text style={styles.ratingText}>{r.rating.toFixed(1)}</Text>
          <Text style={styles.priceDot}>·</Text>
          <Text style={styles.ratingText}>{priceTier(r)}</Text>
        </View>
        {!r.isOpen && (
          <View style={styles.closedOverlay}>
            <View style={styles.closedBadge}>
              <Text style={styles.closedText}>Cerrado</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {r.name}
          </Text>
          {typeof r.distanceKm === 'number' && (
            <Text style={styles.distance}>{r.distanceKm.toFixed(1)} km</Text>
          )}
        </View>

        <View style={styles.metaRow}>
          {category ? (
            <>
              <Text style={styles.metaText}>{category}</Text>
              <Text style={styles.dot}>·</Text>
            </>
          ) : null}
          <Ionicons name="bicycle-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{money(r.deliveryFee)}</Text>
          <Text style={styles.dot}>·</Text>
          <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{r.deliveryTime ?? 30} min</Text>
        </View>
      </View>
    </TouchableOpacity>
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
  cover: { width: '100%', height: 140, backgroundColor: Colors.border },
  ratingPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    ...Shadow.card,
  },
  ratingText: { fontSize: 12, fontWeight: '800', color: Colors.text },
  priceDot: { fontSize: 12, color: Colors.textTertiary },
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
  closedBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  closedText: { color: Colors.text, fontWeight: '800', fontSize: 13 },
  body: { padding: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '800', color: Colors.text, flex: 1, marginRight: 8 },
  distance: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  metaText: { fontSize: 12.5, color: Colors.textSecondary, marginLeft: 3 },
  dot: { marginHorizontal: 6, color: Colors.textTertiary },
});
