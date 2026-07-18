// Escala tipográfica del rol cliente (Inter). Solo se usa dentro de app/(client)/*,
// donde la fuente se carga vía useFonts en app/(client)/_layout.tsx.
export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
} as const;

export const Typography = {
  h1: { fontFamily: FontFamily.bold, fontSize: 24 },
  title: { fontFamily: FontFamily.semiBold, fontSize: 18 },
  body: { fontFamily: FontFamily.regular, fontSize: 15 },
  label: { fontFamily: FontFamily.medium, fontSize: 12 },
  price: { fontFamily: FontFamily.bold, fontSize: 16 },
  meta: { fontFamily: FontFamily.regular, fontSize: 13 },
} as const;
