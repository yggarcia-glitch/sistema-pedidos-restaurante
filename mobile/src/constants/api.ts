import { Platform } from 'react-native';

// ─── Configuración de la API ─────────────────────────────────────────────────
// El backend expone todo bajo el prefijo global "/api".
//
// - Si EXPO_PUBLIC_API_URL está definida (build de producción / EAS), se usa esa.
// - Si no, en WEB (navegador en la misma PC) se usa "localhost".
// - En NATIVO (Expo Go en el teléfono) NO sirve "localhost": debe ser la IP LAN
//   del PC. Reemplaza LOCAL_IP por la tuya (Windows -> ipconfig -> IPv4).
//   El teléfono y el PC deben estar en la misma red Wi-Fi.
const LOCAL_IP = '192.168.1.23';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'web'
    ? 'http://localhost:3000/api'
    : `http://${LOCAL_IP}:3000/api`);

// Claves de almacenamiento seguro para los tokens (expo-secure-store)
export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';

// Fallback de ubicación: Cuenca, Ecuador
export const CUENCA = { lat: -2.9001, lng: -79.0059 } as const;
