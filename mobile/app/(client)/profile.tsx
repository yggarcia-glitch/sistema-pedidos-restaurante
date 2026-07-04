import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/src/constants/colors';
import { useAuth } from '@/src/hooks/useAuth';
import { usersApi } from '@/src/api/users.api';
import { getApiError } from '@/src/api/axios';
import { confirmAction, notify } from '@/src/utils/dialog';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);

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
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Text style={styles.sectionTitle}>Editar perfil</Text>
        <Input label="Nombre" value={name} onChangeText={setName} />
        <Input
          label="Teléfono"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="09XXXXXXXX"
        />
        <Button title="Guardar cambios" onPress={handleSave} loading={saving} fullWidth />

        <View style={{ height: 24 }} />
        <Button title="Cerrar sesión" variant="outline" onPress={handleLogout} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  avatarWrap: { alignItems: 'center', marginVertical: 20 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 32, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 12 },
  email: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
});
