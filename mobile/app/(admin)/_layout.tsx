import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { useAuth } from '@/src/hooks/useAuth';
import { Role } from '@/src/types';
import { Spinner } from '@/src/components/ui/Spinner';

export default function AdminLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (user?.role !== Role.ADMIN) return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: { backgroundColor: Colors.white, borderTopColor: Colors.border },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Panel',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Usuarios',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="restaurants"
        options={{
          title: 'Restaurantes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
