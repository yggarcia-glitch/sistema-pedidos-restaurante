import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { Coords, haversineDistanceKm } from '@/src/utils/geo';

interface Props {
  driver: Coords | null;
  destination: Coords | null;
  destinationLabel?: string;
  restaurant?: Coords | null;
}

// Versión WEB: react-native-maps no funciona en el navegador. Se muestra un panel
// gris a pantalla completa (mismo lugar que ocuparía el mapa) con un resumen.
export function DeliveryMap({ driver, destination, destinationLabel = 'Destino', restaurant }: Props) {
  const origin = driver ?? restaurant ?? null;
  const km = origin && destination ? haversineDistanceKm(origin, destination) : null;

  return (
    <View style={styles.fill}>
      {/* Textura tipo calles */}
      <View style={[styles.street, { top: '24%' }]} />
      <View style={[styles.street, { top: '52%' }]} />
      <View style={[styles.street, { top: '78%' }]} />
      <View style={[styles.streetV, { left: '28%' }]} />
      <View style={[styles.streetV, { left: '64%' }]} />

      <View style={styles.center}>
        <Ionicons name="map-outline" size={30} color={Colors.primary} />
        <Text style={styles.title}>Mapa disponible en el dispositivo</Text>
        {destination && (
          <Text style={styles.meta}>
            {destinationLabel}
            {km != null ? ` · ~${km.toFixed(2)} km` : ''}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#DCE6DD',
    overflow: 'hidden',
  },
  street: { position: 'absolute', left: 0, right: 0, height: 8, backgroundColor: '#CBD8CC' },
  streetV: { position: 'absolute', top: 0, bottom: 0, width: 8, backgroundColor: '#CBD8CC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 24 },
  title: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  meta: { color: Colors.text, fontSize: 13, fontWeight: '700', textAlign: 'center' },
});
