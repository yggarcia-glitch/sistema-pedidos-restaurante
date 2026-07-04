// ─── Enums (coinciden con los del backend NestJS/Prisma) ─────────────────────

export enum Role {
  CLIENTE = 'CLIENTE',
  VENDEDOR = 'VENDEDOR',
  ADMIN = 'ADMIN',
}

export enum OrderStatus {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADO = 'CONFIRMADO',
  EN_PREPARACION = 'EN_PREPARACION',
  LISTO = 'LISTO',
  EN_CAMINO = 'EN_CAMINO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
  RECHAZADO = 'RECHAZADO',
}

export enum DeliveryType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
}

export enum PaymentMethod {
  EFECTIVO = 'EFECTIVO',
  TARJETA_CREDITO = 'TARJETA_CREDITO',
  TARJETA_DEBITO = 'TARJETA_DEBITO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
}

export enum PaymentStatus {
  PENDIENTE = 'PENDIENTE',
  COMPLETADO = 'COMPLETADO',
  FALLIDO = 'FALLIDO',
  REEMBOLSADO = 'REEMBOLSADO',
}

// Los Decimal de Prisma llegan serializados como string en el JSON.
export type Money = string | number;

// ─── Modelos ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  province: string;
  zipCode?: string | null;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  createdAt: string;
}

export interface RestaurantSchedule {
  id: string;
  restaurantId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  street: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  isOpen: boolean;
  isActive: boolean;
  deliveryTime?: number | null;
  deliveryFee: Money;
  minOrder: Money;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
  // Relaciones/derivados que a veces incluye el backend:
  categories?: Category[];
  distanceKm?: number; // lo agrega GET /restaurants/nearby
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  products?: Product[];
}

export interface ProductOptionChoice {
  id: string;
  optionId: string;
  name: string;
  extraPrice: Money;
}

export interface ProductOption {
  id: string;
  productId: string;
  name: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  choices: ProductOptionChoice[];
}

export interface Product {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price: Money;
  discountPct: number;
  isAvailable: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  options?: ProductOption[];
  category?: Category;
}

export interface CartItemChoice {
  id: string;
  cartItemId: string;
  choiceId: string;
  choice?: ProductOptionChoice;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  unitPrice: Money;
  notes?: string | null;
  createdAt: string;
  product?: Product;
  choices?: CartItemChoice[];
}

export interface Cart {
  id: string;
  userId: string;
  restaurantId?: string | null;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
  restaurant?: Restaurant | null;
}

export interface OrderItemChoice {
  id: string;
  orderItemId: string;
  choiceId: string;
  choiceName: string;
  extraPrice: Money;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: Money;
  subtotal: Money;
  notes?: string | null;
  choices?: OrderItemChoice[];
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: Money;
  currency: string;
  transactionId?: string | null;
  receipt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  clientId: string;
  restaurantId: string;
  addressId?: string | null;
  status: OrderStatus;
  deliveryType: DeliveryType;
  subtotal: Money;
  deliveryFee: Money;
  discount: Money;
  total: Money;
  notes?: string | null;
  estimatedTime?: number | null;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string | null;
  restaurant?: Restaurant;
  address?: Address | null;
  items?: OrderItem[];
  payment?: Payment | null;
}

export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  orderId?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

// ─── Respuestas / payloads de la API ─────────────────────────────────────────

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
}
