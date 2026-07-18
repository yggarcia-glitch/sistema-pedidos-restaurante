import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/src/constants/colors';

export type Palette = Record<keyof typeof Colors, string>;

// Paleta oscura derivada de la misma marca naranja (Colors.primary), no un cambio
// de identidad — solo agrega variantes para fondo oscuro.
const DarkColors: Palette = {
  primary: '#FF7A45',
  primaryLight: '#3A2115',
  primaryDark: '#FFD9C2',
  background: '#15130F',
  white: '#211E19', // usado como color de "superficie/card" en toda la app
  border: '#332E27',
  text: '#F5F0EA',
  textSecondary: '#B8B2A9',
  textTertiary: '#7A756C',
  success: '#1E3312',
  successText: '#9CDB77',
  warning: '#3A2A0C',
  warningText: '#F5C97A',
  info: '#122A3F',
  infoText: '#8FC7F5',
  danger: '#3A1414',
  dangerText: '#F5A399',
  amber: '#F5A623',
};

const STORAGE_KEY = '@client_theme';

interface ClientThemeValue {
  colors: Palette;
  isDark: boolean;
  toggleTheme: () => void;
  ready: boolean;
}

const ClientThemeContext = createContext<ClientThemeValue | null>(null);

export function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'dark') setIsDark(true);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  };

  const colors = useMemo(() => (isDark ? DarkColors : Colors), [isDark]);

  return (
    <ClientThemeContext.Provider value={{ colors, isDark, toggleTheme, ready }}>
      {children}
    </ClientThemeContext.Provider>
  );
}

export function useClientTheme() {
  const ctx = useContext(ClientThemeContext);
  if (!ctx) throw new Error('useClientTheme debe usarse dentro de ClientThemeProvider');
  return ctx;
}
