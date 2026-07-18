import React, { ReactNode, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { Colors, Radius, Shadow } from '@/src/constants/colors';

interface Props {
  collapsedHeight: number;
  expandedHeight: number;
  // Se puede colapsar/expandir; children recibe si está expandido para mostrar más datos.
  children: (expanded: boolean) => ReactNode;
  // Si false, el sheet queda fijo colapsado (sin poder subir).
  draggable?: boolean;
}

// Panel deslizable inferior estilo apps de reparto: se arrastra (o se toca la manija)
// entre una posición colapsada y una expandida.
export function DriverSheet({ collapsedHeight, expandedHeight, children, draggable = true }: Props) {
  const range = Math.max(expandedHeight - collapsedHeight, 0);
  // translateY: 0 = expandido; range = colapsado.
  const translateY = useRef(new Animated.Value(range)).current;
  const offset = useRef(range);
  const [expanded, setExpanded] = useState(false);

  const snapTo = (to: number) => {
    offset.current = to;
    setExpanded(to === 0);
    Animated.spring(translateY, {
      toValue: to,
      useNativeDriver: true,
      bounciness: 4,
      speed: 16,
    }).start();
  };

  const toggle = () => snapTo(offset.current > range / 2 ? 0 : range);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => draggable && Math.abs(g.dy) > 6,
        onPanResponderMove: (_e, g) => {
          const next = Math.min(Math.max(offset.current + g.dy, 0), range);
          translateY.setValue(next);
        },
        onPanResponderRelease: (_e, g) => {
          const next = Math.min(Math.max(offset.current + g.dy, 0), range);
          // Snap según posición + velocidad del gesto.
          const goCollapsed = g.vy > 0.5 ? true : g.vy < -0.5 ? false : next > range / 2;
          snapTo(goCollapsed ? range : 0);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, draggable],
  );

  return (
    <Animated.View
      style={[styles.sheet, { height: expandedHeight, transform: [{ translateY }] }]}
    >
      {/* Manija (arrastrar o tocar para subir/bajar) */}
      <View {...(draggable ? pan.panHandlers : {})}>
        <Pressable onPress={draggable ? toggle : undefined} style={styles.handleZone}>
          <View style={styles.handle} />
        </Pressable>
      </View>
      <View style={styles.body}>{children(expanded)}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    ...Shadow.card,
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  handleZone: { alignItems: 'center', paddingTop: 10, paddingBottom: 6 },
  handle: { width: 44, height: 5, borderRadius: Radius.pill, backgroundColor: Colors.border },
  body: { flex: 1, paddingHorizontal: 18, paddingBottom: 22 },
});
