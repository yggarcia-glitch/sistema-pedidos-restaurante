import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '@/src/constants/colors';

interface Props {
  size?: number;
}

// Cuadrado naranja con el ícono de la marca (mismo lenguaje visual que la web).
export function BrandMark({ size = 56 }: Props) {
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: Radius.logo },
      ]}
    >
      <Ionicons name="restaurant" size={size * 0.5} color={Colors.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
});
