import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { useAuth } from '@/src/hooks/useAuth';
import { Role } from '@/src/types';
import { Spinner } from '@/src/components/ui/Spinner';

export default function RepartidorLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (user?.rol?.nombre !== Role.REPARTIDOR) return <Redirect href="/" />;

  // Sin tabs: el panel usa un mapa a pantalla completa. El perfil se abre por push
  // desde el menú de acciones.
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          title: 'Mi perfil',
          headerTintColor: Colors.text,
          headerStyle: { backgroundColor: Colors.white },
        }}
      />
    </Stack>
  );
}
