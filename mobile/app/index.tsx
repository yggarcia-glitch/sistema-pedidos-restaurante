import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/src/constants/colors';
import { useAuth } from '@/src/hooks/useAuth';
import { Role } from '@/src/types';
import { Spinner } from '@/src/components/ui/Spinner';
import { Button } from '@/src/components/ui/Button';

const ONBOARDING_FLAG = 'onboarding_seen';

// Punto de entrada. La app móvil sirve a clientes y repartidores;
// los locales (vendedores) y el administrador gestionan desde la versión web.
export default function Index() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_FLAG).then((v) => setOnboardingSeen(v === '1'));
  }, []);

  if (isLoading || onboardingSeen === null) return <Spinner text="Cargando…" />;

  if (!onboardingSeen) {
    return <Redirect href="/onboarding" />;
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Cliente → app normal.
  if (user.rol.nombre === Role.CLIENTE) {
    return <Redirect href="/(client)" />;
  }

  // Repartidor → panel de reparto (mobile-only, ver /(repartidor)).
  if (user.rol.nombre === Role.REPARTIDOR) {
    return <Redirect href="/(repartidor)" />;
  }

  // Vendedor / Admin → aviso de que usen la web.
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Ionicons name="laptop-outline" size={64} color={Colors.primary} />
        <Text style={styles.title}>Esta app es solo para clientes</Text>
        <Text style={styles.text}>
          Los locales y el administrador gestionan sus pedidos desde la versión web.
          Inicia sesión ahí con tu cuenta.
        </Text>
        <Button title="Cerrar sesión" variant="outline" onPress={logout} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  text: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
});
