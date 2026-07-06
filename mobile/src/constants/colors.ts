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
  amber: '#F5A623', // estrellas de rating
} as const;

// Sombra de tarjeta reutilizable (iOS + Android). Se esparce con {...Shadow.card}.
export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

// Radios consistentes con el diseño web (cards 10, inputs 8, pills 999).
export const Radius = {
  card: 12,
  input: 12,
  pill: 999,
  logo: 18,
} as const;

export type ColorKey = keyof typeof Colors;
