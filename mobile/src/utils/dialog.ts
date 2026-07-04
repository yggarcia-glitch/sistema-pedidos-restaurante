import { Alert, Platform } from 'react-native';

// Diálogos multiplataforma.
// react-native-web NO implementa Alert.alert con botones interactivos, por lo que
// en web se usan window.confirm / window.alert. En nativo se usa Alert de RN.

export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  options?: { confirmText?: string; cancelText?: string; destructive?: boolean },
) {
  const confirmText = options?.confirmText ?? 'Aceptar';
  const cancelText = options?.cancelText ?? 'Cancelar';

  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel' },
    {
      text: confirmText,
      style: options?.destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ]);
}

// Aviso simple de una sola acción (info / error).
export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
