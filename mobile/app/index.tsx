import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';
import { Role } from '@/src/types';
import { Spinner } from '@/src/components/ui/Spinner';

// Punto de entrada: decide a dónde ir según el estado de sesión y el rol.
export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <Spinner text="Cargando…" />;

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  switch (user.role) {
    case Role.VENDEDOR:
      return <Redirect href="/(vendor)/dashboard" />;
    case Role.ADMIN:
      return <Redirect href="/(admin)/dashboard" />;
    default:
      return <Redirect href="/(client)" />;
  }
}
