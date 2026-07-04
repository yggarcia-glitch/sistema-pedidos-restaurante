import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/src/constants/colors';

type BadgeType = 'ok' | 'warn' | 'info' | 'danger' | 'default';

interface Props {
  label: string;
  type?: BadgeType;
}

const PALETTE: Record<BadgeType, { bg: string; fg: string }> = {
  ok: { bg: Colors.success, fg: Colors.successText },
  warn: { bg: Colors.warning, fg: Colors.warningText },
  info: { bg: Colors.info, fg: Colors.infoText },
  danger: { bg: Colors.danger, fg: Colors.dangerText },
  default: { bg: Colors.border, fg: Colors.textSecondary },
};

export function Badge({ label, type = 'default' }: Props) {
  const c = PALETTE[type];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '700' },
});
