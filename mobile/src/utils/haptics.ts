import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// expo-haptics no tiene soporte real en web; se omite ahí.
export const haptics = {
  tap: () => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  success: () => {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
};
