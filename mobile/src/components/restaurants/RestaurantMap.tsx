import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors } from '@/src/constants/colors';
import { CUENCA } from '@/src/constants/api';
import { Restaurant } from '@/src/types';
import { Button } from '@/src/components/ui/Button';

interface Props {
  restaurants: Restaurant[];
  userCoords: { lat: number; lng: number } | null;
  onSelectRestaurant: (id: string) => void;
  height?: number;
}

// Mapa con marcadores de restaurantes cercanos.
// - Centra en la ubicación real del usuario si está disponible; si no, en Cuenca.
// - Marcador azul del usuario, marcadores naranjas de restaurantes con Callout.
export function RestaurantMap({
  restaurants,
  userCoords,
  onSelectRestaurant,
  height = 220,
}: Props) {
  const center = userCoords ?? CUENCA;

  return (
    <View style={[styles.wrapper, { height }]}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={!!userCoords}
      >
        {/* Ubicación del usuario (marcador azul) */}
        {userCoords && (
          <Marker
            coordinate={{ latitude: userCoords.lat, longitude: userCoords.lng }}
            title="Tu ubicación"
            pinColor="blue"
          />
        )}

        {/* Restaurantes cercanos (marcadores naranjas + Callout) */}
        {restaurants.map((r) => (
          <Marker
            key={r.id}
            coordinate={{ latitude: r.latitude, longitude: r.longitude }}
            pinColor={Colors.primary}
          >
            <Callout tooltip onPress={() => onSelectRestaurant(r.id)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle} numberOfLines={1}>
                  {r.name}
                </Text>
                <Text style={styles.calloutMeta}>
                  ⭐ {r.rating.toFixed(1)} · {r.deliveryTime ?? 30} min
                </Text>
                <Button title="Ver menú" onPress={() => onSelectRestaurant(r.id)} />
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  map: { flex: 1 },
  callout: {
    width: 200,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  calloutTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  calloutMeta: { fontSize: 13, color: Colors.textSecondary },
});
