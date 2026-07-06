import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadow } from '@/src/constants/colors';
import { useAuth } from '@/src/hooks/useAuth';
import { usersApi } from '@/src/api/users.api';
import { getApiError } from '@/src/api/axios';
import { confirmAction, notify } from '@/src/utils/dialog';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

const OPTIONS: { icon: keyof typeof Ionicons.glyphMap; label: string; route?: string }[] = [
  { icon: 'receipt-outline', label: 'Mis pedidos', route: '/(client)/history' },
  { icon: 'location-outline', label: 'Mis direcciones' },
  { icon: 'card-outline', label: 'Métodos de pago' },
  { icon: 'notifications-outline', label: 'Notificaciones' },
  { icon: 'help-circle-outline', label: 'Ayuda' },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const initials = (user?.name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await usersApi.update(user.id, { name: name.trim(), phone: phone.trim() || null });
      setEditing(false);
      notify('Listo', 'Tu perfil fue actualizado.');
    } catch (e) {
      notify('Error', getApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    confirmAction('Cerrar sesión', '¿Deseas cerrar sesión?', () => logout(), {
      confirmText: 'Cerrar sesión',
      destructive: true,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Encabezado con avatar */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing((v) => !v)}>
            <Ionicons name={editing ? 'close' : 'create-outline'} size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Edición (colapsable) */}
        {editing && (
          <View style={styles.card}>
            <Input label="Nombre" value={name} onChangeText={setName} />
            <Input
              label="Teléfono"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="09XXXXXXXX"
            />
            <Button title="Guardar cambios" onPress={handleSave} loading={saving} fullWidth />
          </View>
        )}

        {/* Lista de opciones */}
        <View style={styles.list}>
          {OPTIONS.map((opt, i) => (
            <TouchableOpacity
              key={opt.label}
              style={[styles.optionRow, i < OPTIONS.length - 1 && styles.optionBorder]}
              activeOpacity={0.7}
              onPress={() => opt.route && router.push(opt.route as never)}
            >
              <Ionicons name={opt.icon} size={20} color={Colors.textSecondary} />
              <Text style={styles.optionLabel}>{opt.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Cerrar sesión" variant="danger" onPress={handleLogout} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 14 },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 999,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.primaryDark, fontSize: 22, fontWeight: '800' },
  name: { fontSize: 18, fontWeight: '800', color: Colors.text },
  email: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  list: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.card,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  optionBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  optionLabel: { flex: 1, fontSize: 15, color: Colors.text, fontWeight: '600' },
});
