import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { Restaurant } from '@/src/types';

interface Props {
  restaurants: Restaurant[];
  userCoords: { lat: number; lng: number } | null;
  onSelectRestaurant: (id: string) => void;
  height?: number;
}

// Versión WEB del mapa: react-native-maps no funciona en el navegador, así que
// se muestra un panel con accesos rápidos a los restaurantes cercanos.
// (Metro selecciona este archivo .web.tsx automáticamente en la plataforma web.)
export function RestaurantMap({ restaurants, onSelectRestaurant, height = 220 }: Props) {
  return (
    <View style={[styles.wrapper, { height }]}>
      <View style={styles.header}>
        <Ionicons name="map-outline" size={20} color={Colors.primary} />
        <Text style={styles.headerText}>Mapa disponible en la app móvil (iOS/Android)</Text>
      </View>
      <View style={styles.chips}>
        {restaurants.slice(0, 6).map((r) => (
          <TouchableOpacity
            key={r.id}
            style={styles.chip}
            onPress={() => onSelectRestaurant(r.id)}
          >
            <Ionicons name="location" size={14} color={Colors.primary} />
            <Text style={styles.chipText} numberOfLines={1}>
              {r.name}
            </Text>
          </TouchableOpacity>
        ))}
        {restaurants.length === 0 && (
          <Text style={styles.empty}>No hay restaurantes cercanos.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  headerText: { color: Colors.textSecondary, fontSize: 13, flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: '48%',
  },
  chipText: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  empty: { color: Colors.textSecondary },
});
