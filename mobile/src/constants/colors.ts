// Paleta de la app (misma identidad visual que el frontend web)
export const Colors = {
  primary: '#E85D26',
  primaryLight: '#FEF0EA',
  primaryDark: '#7A2A0E',
  background: '#F5F4F0',
  white: '#FFFFFF',
  border: '#E8E7E3',
  text: '#1C1B19',
  textSecondary: '#6E6D69',
  textTertiary: '#B5B4B0',
  success: '#EAF3DE',
  successText: '#27500A',
  warning: '#FAEEDA',
  warningText: '#633806',
  info: '#E6F1FB',
  infoText: '#0C447C',
  danger: '#FEE2E2',
  dangerText: '#C0392B',
} as const;

export type ColorKey = keyof typeof Colors;
