import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { Coords, haversineDistanceKm } from '@/src/utils/geo';

interface Props {
  driverCoords: Coords;
  destination: Coords;
  destinationLabel: string;
  originLabel?: string;
  height?: number;
}

// Versión WEB: react-native-maps no funciona en el navegador (igual que RestaurantMap.web.tsx).
export function DriverRouteMap({ driverCoords, destination, destinationLabel, height = 220 }: Props) {
  const km = haversineDistanceKm(driverCoords, destination);

  return (
    <View style={[styles.wrapper, { height }]}>
      <Ionicons name="map-outline" size={28} color={Colors.primary} />
      <Text style={styles.title}>Mapa disponible en la app móvil (iOS/Android)</Text>
      <Text style={styles.meta}>
        Destino: {destinationLabel} · ~{km.toFixed(2)} km en línea recta
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  title: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center' },
  meta: { color: Colors.text, fontSize: 13, fontWeight: '700', textAlign: 'center' },
});
