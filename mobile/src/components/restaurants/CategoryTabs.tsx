import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors, Radius } from '@/src/constants/colors';

interface Props {
  items: { id: string; name: string }[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  includeAll?: boolean;
}

// Fila horizontal de "pills" para filtrar por categoría.
export function CategoryTabs({ items, activeId, onSelect, includeAll = true }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {includeAll && (
        <Pill label="Todos" active={activeId === null} onPress={() => onSelect(null)} />
      )}
      {items.map((it) => (
        <Pill
          key={it.id}
          label={it.name}
          active={activeId === it.id}
          onPress={() => onSelect(it.id)}
        />
      ))}
    </ScrollView>
  );
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.pill, active && styles.pillActive]}
      activeOpacity={0.8}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pillText: { color: Colors.textSecondary, fontWeight: '700', fontSize: 13 },
  pillTextActive: { color: Colors.white },
});
