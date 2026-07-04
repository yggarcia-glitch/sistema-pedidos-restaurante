import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { authApi } from '@/src/api/auth.api';
import {
  clearTokens,
  getAccessToken,
  saveTokens,
} from '@/src/api/axios';
import { RegisterPayload, User } from '@/src/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al montar la app: si hay token en SecureStore, restaura la sesión con /auth/me.
  useEffect(() => {
    (async () => {
      const token = await getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await authApi.me();
        setUser(data);
      } catch {
        await clearTokens();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    await saveTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { data } = await authApi.register(payload);
    await saveTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Continúa aunque el logout del servidor falle.
    }
    await clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
