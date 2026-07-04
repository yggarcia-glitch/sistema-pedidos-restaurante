import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';
import { Spinner } from '@/src/components/ui/Spinner';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  // Si ya hay sesión, no mostrar login/register: volver al enrutador raíz.
  if (isAuthenticated) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
