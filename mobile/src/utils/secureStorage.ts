import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Almacenamiento de tokens multiplataforma.
// - Nativo (iOS/Android): expo-secure-store (Keychain / Keystore).
// - Web: localStorage, porque SecureStore no está disponible en el navegador.
// El import de SecureStore es seguro en web; solo fallaría si se LLAMARA allí.

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

export async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
