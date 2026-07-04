// ─── Configuración de la API ─────────────────────────────────────────────────
// IMPORTANTE: reemplaza la IP por la de la máquina donde corre el backend NestJS.
// En Expo Go (dispositivo físico) NO sirve "localhost": debe ser la IP LAN del PC.
// El backend expone todo bajo el prefijo global "/api".
//
// Para saber tu IP: Windows -> ipconfig (IPv4). Ambos deben estar en la misma red.
const LOCAL_IP = '192.168.21.100';

export const API_URL = `http://${LOCAL_IP}:3000/api`;

// Claves de almacenamiento seguro para los tokens (expo-secure-store)
export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';

// Fallback de ubicación: Cuenca, Ecuador
export const CUENCA = { lat: -2.9001, lng: -79.0059 } as const;
