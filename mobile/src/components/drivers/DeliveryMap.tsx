import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors } from '@/src/constants/colors';
import { Coords, fetchRoute } from '@/src/utils/geo';

interface Props {
  driver: Coords | null;
  destination: Coords | null;
  destinationLabel?: string;
  restaurant?: Coords | null;
}

// Mapa a pantalla completa del panel del repartidor (estilo apps de reparto).
// Dibuja al repartidor, el destino actual y la ruta real (OSRM) entre ambos.
export function DeliveryMap({ driver, destination, destinationLabel = 'Destino', restaurant }: Props) {
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const mapRef = useRef<MapView | null>(null);

  const origin = driver ?? restaurant ?? null;

  // Ruta real por calles entre el origen (repartidor) y el destino.
  useEffect(() => {
    if (!origin || !destination) {
      setRoute([]);
      return;
    }
    let cancelled = false;
    fetchRoute(origin, destination).then((coords) => {
      if (!cancelled) setRoute(coords);
    });
    return () => {
      cancelled = true;
    };
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

  // Encuadra el mapa para que se vean el repartidor y el destino.
  useEffect(() => {
    const pts = [driver, destination, restaurant].filter(Boolean) as Coords[];
    if (pts.length === 0 || !mapRef.current) return;
    if (pts.length === 1) {
      mapRef.current.animateToRegion(
        { latitude: pts[0].lat, longitude: pts[0].lng, latitudeDelta: 0.02, longitudeDelta: 0.02 },
        400,
      );
      return;
    }
    mapRef.current.fitToCoordinates(
      pts.map((p) => ({ latitude: p.lat, longitude: p.lng })),
      { edgePadding: { top: 90, right: 60, bottom: 320, left: 60 }, animated: true },
    );
  }, [driver?.lat, driver?.lng, destination?.lat, destination?.lng, restaurant?.lat, restaurant?.lng]);

  const initial = origin ?? destination ?? { lat: -2.9001, lng: -79.0059 };

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_DEFAULT}
      style={StyleSheet.absoluteFill}
      showsUserLocation={false}
      initialRegion={{
        latitude: initial.lat,
        longitude: initial.lng,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }}
    >
      {restaurant && (
        <Marker
          coordinate={{ latitude: restaurant.lat, longitude: restaurant.lng }}
          title="Restaurante"
          pinColor={Colors.primary}
        />
      )}
      {destination && (
        <Marker
          coordinate={{ latitude: destination.lat, longitude: destination.lng }}
          title={destinationLabel}
          pinColor="red"
        />
      )}
      {driver && (
        <Marker
          coordinate={{ latitude: driver.lat, longitude: driver.lng }}
          title="Tú"
          pinColor="blue"
        />
      )}
      {route.length > 1 && (
        <Polyline coordinates={route} strokeColor={Colors.primary} strokeWidth={5} />
      )}
    </MapView>
  );
}
