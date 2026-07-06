import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/src/constants/colors';

interface Props {
  eta?: string;
  moving?: boolean; // true cuando el pedido va EN_CAMINO
}

// Panel de mapa estilizado (Views puras) para el seguimiento del repartidor.
// No usa react-native-maps para funcionar igual en web y en dispositivo.
export function CourierMap({ eta, moving = true }: Props) {
  return (
    <View style={styles.map}>
      {/* Textura tipo calles */}
      <View style={[styles.street, { top: '28%', left: 0, right: 0 }]} />
      <View style={[styles.street, { top: '66%', left: 0, right: 0 }]} />
      <View style={[styles.streetV, { left: '30%', top: 0, bottom: 0 }]} />
      <View style={[styles.streetV, { left: '72%', top: 0, bottom: 0 }]} />

      {/* Ruta punteada del local al destino */}
      <View style={styles.route} />

      {/* Pin del restaurante */}
      <View style={[styles.pin, styles.pinRestaurant]}>
        <Ionicons name="storefront" size={16} color={Colors.white} />
      </View>

      {/* Pin del destino */}
      <View style={[styles.pin, styles.pinDest]}>
        <Ionicons name="location" size={16} color={Colors.white} />
      </View>

      {/* Repartidor */}
      <View style={styles.courier}>
        <View style={styles.courierDot}>
          <Ionicons name="bicycle" size={20} color={Colors.white} />
        </View>
      </View>

      {/* ETA */}
      <View style={styles.etaPill}>
        <Ionicons name="time" size={13} color={Colors.primary} />
        <Text style={styles.etaText}>{moving ? (eta ?? '20–30 min') : 'Preparando…'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 190,
    borderRadius: Radius.card,
    backgroundColor: '#DCE6DD',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  street: { position: 'absolute', height: 6, backgroundColor: '#CBD8CC' },
  streetV: { position: 'absolute', width: 6, backgroundColor: '#CBD8CC' },
  route: {
    position: 'absolute',
    top: '34%',
    left: '20%',
    width: '58%',
    borderTopWidth: 3,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    transform: [{ rotate: '30deg' }],
  },
  pin: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadow.card,
  },
  pinRestaurant: { top: '20%', left: '16%', backgroundColor: Colors.text },
  pinDest: { bottom: '18%', right: '16%', backgroundColor: Colors.infoText },
  courier: { position: 'absolute', top: '42%', left: '46%' },
  courierDot: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    ...Shadow.card,
    shadowOpacity: 0.25,
  },
  etaPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    ...Shadow.card,
  },
  etaText: { fontSize: 12, fontWeight: '800', color: Colors.text },
});
