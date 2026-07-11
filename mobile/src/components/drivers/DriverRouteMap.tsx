import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors } from '@/src/constants/colors';
import { Coords, fetchRoute } from '@/src/utils/geo';

interface Props {
  driverCoords: Coords;
  destination: Coords;
  destinationLabel: string;
  height?: number;
}

// Mapa con la ruta real (OSRM) del repartidor hacia el punto de retiro o de entrega.
export function DriverRouteMap({ driverCoords, destination, destinationLabel, height = 220 }: Props) {
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchRoute(driverCoords, destination).then((coords) => {
      if (!cancelled) setRoute(coords);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverCoords.lat, driverCoords.lng, destination.lat, destination.lng]);

  return (
    <View style={[styles.wrapper, { height }]}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        region={{
          latitude: (driverCoords.lat + destination.lat) / 2,
          longitude: (driverCoords.lng + destination.lng) / 2,
          latitudeDelta: Math.max(Math.abs(driverCoords.lat - destination.lat) * 2.2, 0.01),
          longitudeDelta: Math.max(Math.abs(driverCoords.lng - destination.lng) * 2.2, 0.01),
        }}
      >
        <Marker
          coordinate={{ latitude: driverCoords.lat, longitude: driverCoords.lng }}
          title="Tú"
          pinColor="blue"
        />
        <Marker
          coordinate={{ latitude: destination.lat, longitude: destination.lng }}
          title={destinationLabel}
          pinColor={Colors.primary}
        />
        {route.length > 1 && (
          <Polyline coordinates={route} strokeColor={Colors.primary} strokeWidth={4} />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  map: { flex: 1 },
});
