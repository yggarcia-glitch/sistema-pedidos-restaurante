import React, { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { Role, User } from '@/src/types';
import { usersApi } from '@/src/api/users.api';
import { getApiError } from '@/src/api/axios';
import { Spinner } from '@/src/components/ui/Spinner';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';

const ROLE_BADGE: Record<Role, 'info' | 'warn' | 'danger'> = {
  [Role.CLIENTE]: 'info',
  [Role.VENDEDOR]: 'warn',
  [Role.ADMIN]: 'danger',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await usersApi.findAll();
      setUsers(data);
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const toggleActive = async (user: User) => {
    try {
      const { data } = await usersApi.update(user.id, { isActive: !user.isActive });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? data : u)));
    } catch (e) {
      setError(getApiError(e));
    }
  };

  if (loading) return <Spinner text="Cargando usuarios…" />;

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Usuarios</Text>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o correo"
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <View style={styles.badgeRow}>
                <Badge label={item.role} type={ROLE_BADGE[item.role]} />
              </View>
            </View>
            <Switch
              value={item.isActive}
              onValueChange={() => toggleActive(item)}
              trackColor={{ true: Colors.primary }}
            />
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>{error ?? 'No hay usuarios.'}</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  list: { padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  info: { flex: 1, paddingRight: 12 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.text },
  email: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  badgeRow: { flexDirection: 'row', marginTop: 8 },
  empty: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: 40 },
});
