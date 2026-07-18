import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { useAuth } from '@/src/hooks/useAuth';
import { useCart } from '@/src/hooks/useCart';
import { Role } from '@/src/types';
import { Spinner } from '@/src/components/ui/Spinner';
import { ClientThemeProvider, useClientTheme } from '@/src/theme/ClientThemeContext';

function ClientTabs() {
  const { itemCount } = useCart();
  const { colors } = useClientTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrito',
          // Badge con la cantidad de ítems en el carrito
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'cart' : 'cart-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
      {/* Rutas del grupo que NO son tabs (se navegan por push) */}
      <Tabs.Screen name="restaurant/[id]" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
      <Tabs.Screen name="tracking/[orderId]" options={{ href: null }} />
      <Tabs.Screen name="addresses" options={{ href: null }} />
    </Tabs>
  );
}

export default function ClientLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (isLoading || !fontsLoaded) return <Spinner />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  // La app móvil es solo para clientes; si no lo es, vuelve a la raíz (que
  // muestra el aviso de gestionar desde la web).
  if (user?.rol?.nombre !== Role.CLIENTE) return <Redirect href="/" />;

  return (
    <ClientThemeProvider>
      <ClientTabs />
    </ClientThemeProvider>
  );
}
