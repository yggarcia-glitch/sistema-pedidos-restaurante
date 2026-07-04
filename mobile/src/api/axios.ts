import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { router } from 'expo-router';
import {
  ACCESS_TOKEN_KEY,
  API_URL,
  REFRESH_TOKEN_KEY,
} from '@/src/constants/api';
import { deleteItem, getItem, setItem } from '@/src/utils/secureStorage';

// Instancia principal de Axios apuntando al backend NestJS (prefijo /api).
const api = axios.create({ baseURL: API_URL, timeout: 15000 });

// ─── Helpers de tokens (SecureStore en nativo, localStorage en web) ──────────────
export async function saveTokens(accessToken: string, refreshToken: string) {
  await setItem(ACCESS_TOKEN_KEY, accessToken);
  await setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens() {
  await deleteItem(ACCESS_TOKEN_KEY);
  await deleteItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken() {
  return getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return getItem(REFRESH_TOKEN_KEY);
}

// ─── Interceptor de REQUEST ──────────────────────────────────────────────────
// Antes de cada petición inyecta el access token guardado en SecureStore.
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Interceptor de RESPONSE ─────────────────────────────────────────────────
// Si el backend responde 401, intenta renovar el access token con el refresh
// token (endpoint /auth/refresh). Si el refresh falla, limpia la sesión y
// redirige a /login. La bandera _retry evita bucles infinitos de refresh.
interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const refreshToken = await getRefreshToken();

      if (refreshToken) {
        try {
          // Se usa axios "pelado" (no la instancia) para no re-disparar el interceptor.
          const { data } = await axios.post(
            `${API_URL}/auth/refresh`,
            null,
            { headers: { Authorization: `Bearer ${refreshToken}` } },
          );
          await saveTokens(data.accessToken, data.refreshToken);
          original.headers = {
            ...original.headers,
            Authorization: `Bearer ${data.accessToken}`,
          };
          return api(original);
        } catch {
          // El refresh falló: cerrar sesión y volver al login.
          await clearTokens();
          router.replace('/(auth)/login');
        }
      } else {
        await clearTokens();
        router.replace('/(auth)/login');
      }
    }

    return Promise.reject(error);
  },
);

// Extrae un mensaje de error legible de una respuesta del backend.
export function getApiError(error: unknown, fallback = 'Ocurrió un error'): string {
  const err = error as AxiosError<{ message?: string | string[] }>;
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg[0];
  return msg ?? fallback;
}

export default api;
