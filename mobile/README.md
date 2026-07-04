# App Móvil — Sistema de Pedidos de Restaurante

App móvil en **React Native + Expo (Expo Router)** que consume la misma API REST
NestJS del proyecto (carpeta `../` del backend). Estilo tipo Uber Eats con tres
roles: **CLIENTE**, **VENDEDOR** y **ADMIN**.

## Stack

- Expo SDK 57 + Expo Router (navegación por archivos)
- TypeScript estricto
- Axios con interceptors (refresh token automático)
- React Context (Auth + Carrito) + React Hook Form
- expo-location + react-native-maps (restaurantes cercanos)
- expo-secure-store (tokens guardados de forma segura)

## Configuración (IMPORTANTE)

1. **IP del backend.** Edita `src/constants/api.ts` y reemplaza `LOCAL_IP` por la
   IP LAN de la máquina donde corre el backend NestJS (en Windows: `ipconfig` →
   IPv4). El backend expone todo bajo el prefijo `/api`, en el puerto `3000`.

   ```ts
   const LOCAL_IP = '192.168.21.100'; // <-- tu IP
   export const API_URL = `http://${LOCAL_IP}:3000/api`;
   ```

   > En Expo Go (dispositivo físico) **no** sirve `localhost`. El teléfono y el PC
   > deben estar en la **misma red Wi-Fi**.

2. **Backend corriendo.** Desde `../` ejecuta `npm run start:dev` (puerto 3000).

## Ejecutar

```bash
npm install        # ya instalado
npx expo start     # abre Expo Go escaneando el QR
```

- Android: instala **Expo Go** desde Play Store y escanea el QR.
- Presiona `a` (Android) / `i` (iOS) para abrir en emulador.

## Credenciales de prueba

| Rol       | Email                | Contraseña |
|-----------|----------------------|-----------|
| Cliente   | `cliente@test.com`   | `Test1234` |
| Vendedor  | `vendedor@test.com`  | `Test1234` |
| Admin     | `admin@test.com`     | `Test1234` |

## Estructura

```
app/                 Rutas (Expo Router)
  (auth)/            login, register
  (client)/          home, restaurante, carrito, checkout, tracking, pedidos, perfil
  (vendor)/          dashboard, pedidos, menú
  (admin)/           dashboard, usuarios, restaurantes
src/
  api/               instancia axios + módulos por recurso
  context/           AuthContext, CartContext
  hooks/             useAuth, useCart, useMyRestaurant
  components/        ui/ + restaurants/ + products/ + cart/ + orders/
  constants/         colors, api, status
  types/             interfaces + enums (espejo del backend)
```

## Notas sobre la API real

Este cliente se alineó al backend **existente** (no a valores inventados):

- Los **enums están en español** (`PENDIENTE`, `EFECTIVO`, …), tal como el backend.
- `GET /restaurants` y `GET /orders` devuelven **paginado** `{ data, total, page, totalPages }`.
- `GET /restaurants/nearby` devuelve un **array** con `distanceKm` calculado.
- El backend **no expone endpoints de direcciones (`Address`)**, por lo que el
  carrito/checkout usan tipo de entrega (DELIVERY/PICKUP) + notas, sin selector de
  direcciones. El `addressId` es opcional en `POST /orders`.
- El vendedor resuelve "su restaurante" buscando por `ownerId` en el listado,
  ya que no hay endpoint "mi restaurante".
- Los mapas en Android usan el proveedor por defecto; para Google Maps en build
  nativa, añade tu API key en `app.json` → `android.config.googleMaps.apiKey`.
```
