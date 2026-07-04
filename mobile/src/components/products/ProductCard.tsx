import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/src/constants/colors';
import { money } from '@/src/constants/status';
import { Product } from '@/src/types';

interface Props {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: Props) {
  const hasDiscount = product.discountPct > 0;
  const price = Number(product.price);
  const finalPrice = hasDiscount ? price * (1 - product.discountPct / 100) : price;

  return (
    <TouchableOpacity
      style={[styles.row, !product.isAvailable && styles.unavailable]}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!product.isAvailable}
    >
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        {product.description ? (
          <Text style={styles.desc} numberOfLines={2}>
            {product.description}
          </Text>
        ) : null}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{money(finalPrice)}</Text>
          {hasDiscount && <Text style={styles.oldPrice}>{money(price)}</Text>}
        </View>
        {!product.isAvailable && <Text style={styles.soldOut}>No disponible</Text>}
      </View>
      <Image
        source={{
          uri:
            product.imageUrl ??
            `https://placehold.co/200x200/FEF0EA/E85D26/png?text=${encodeURIComponent(
              product.name.slice(0, 8),
            )}`,
        }}
        style={styles.image}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  unavailable: { opacity: 0.55 },
  info: { flex: 1, paddingRight: 12 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.text },
  desc: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  price: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  oldPrice: {
    fontSize: 13,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  soldOut: { fontSize: 12, color: Colors.dangerText, marginTop: 4 },
  image: { width: 84, height: 84, borderRadius: 8, backgroundColor: Colors.border },
});
