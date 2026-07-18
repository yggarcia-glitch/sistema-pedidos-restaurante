import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

// Coordenadas base: centro de Cuenca, Ecuador (fallback de la app).
const CUENCA = { lat: -2.9001, lng: -79.0059 };

interface ProductSeed {
  name: string;
  description: string;
  price: number;
  discountPct?: number;
  options?: {
    name: string;
    isRequired?: boolean;
    minSelect?: number;
    maxSelect?: number;
    choices: { name: string; extraPrice?: number }[];
  }[];
}

interface RestaurantSeed {
  ownerEmail: string;
  ownerName: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  phone: string;
  deliveryTime: number;
  deliveryFee: number;
  categories: { name: string; products: ProductSeed[] }[];
}

const PASSWORD = 'Test1234';

// Usuarios de prueba (se upsertan por email).
const USERS = [
  { name: 'Cliente Demo', email: 'cliente@test.com', role: 'CLIENTE' as const, phone: '0991234567' },
  { name: 'Vendedor Demo', email: 'vendedor@test.com', role: 'VENDEDOR' as const, phone: '0991234568' },
  { name: 'Admin Demo', email: 'admin@test.com', role: 'ADMIN' as const, phone: undefined },
  { name: 'María Pizzas', email: 'maria@test.com', role: 'VENDEDOR' as const, phone: '0991234569' },
  { name: 'Kenji Sushi', email: 'kenji@test.com', role: 'VENDEDOR' as const, phone: '0991234570' },
  { name: 'Luis Repartidor', email: 'repartidor1@test.com', role: 'REPARTIDOR' as const, phone: '0991234571' },
  { name: 'Andrea Repartidor', email: 'repartidor2@test.com', role: 'REPARTIDOR' as const, phone: '0991234572' },
];

// Coordenadas de arranque de los repartidores de prueba (ambos disponibles):
// repartidor1 queda muy cerca de Burger House Cuenca (~200m); repartidor2 más lejos (~2.5km).
const DRIVERS = [
  { email: 'repartidor1@test.com', lat: CUENCA.lat + 0.0035, lng: CUENCA.lng + 0.0015 },
  { email: 'repartidor2@test.com', lat: CUENCA.lat + 0.025, lng: CUENCA.lng - 0.02 },
];

// "Casa" (punto de entrega fijo) de los clientes de prueba. Como el sistema aún no
// tiene módulo de direcciones, esta coordenada es el destino de la ruta que ve el
// cliente en el seguimiento (~1.5 km de Burger House Cuenca).
const CLIENT_HOMES = [
  { email: 'cliente@test.com', lat: CUENCA.lat - 0.012, lng: CUENCA.lng + 0.008 },
];

const RESTAURANTS: RestaurantSeed[] = [
  {
    ownerEmail: 'vendedor@test.com',
    ownerName: 'Vendedor Demo',
    name: 'Burger House Cuenca',
    description: 'Las mejores hamburguesas artesanales de la ciudad.',
    lat: CUENCA.lat + 0.002,
    lng: CUENCA.lng + 0.001,
    phone: '0999000001',
    deliveryTime: 25,
    deliveryFee: 1.5,
    categories: [
      {
        name: 'Hamburguesas',
        products: [
          {
            name: 'Clásica Doble',
            description: 'Doble carne, queso cheddar, lechuga, tomate y salsa de la casa.',
            price: 6.5,
            options: [
              {
                name: 'Punto de la carne',
                isRequired: true,
                minSelect: 1,
                maxSelect: 1,
                choices: [{ name: 'Término medio' }, { name: 'Bien cocida' }],
              },
              {
                name: 'Extras',
                maxSelect: 3,
                choices: [
                  { name: 'Tocino', extraPrice: 1.0 },
                  { name: 'Huevo', extraPrice: 0.75 },
                  { name: 'Queso extra', extraPrice: 0.5 },
                ],
              },
            ],
          },
          {
            name: 'BBQ Bacon',
            description: 'Carne, tocino crocante, aros de cebolla y salsa BBQ.',
            price: 7.25,
            discountPct: 10,
          },
          {
            name: 'Veggie',
            description: 'Medallón de garbanzo, aguacate y vegetales frescos.',
            price: 6.0,
          },
        ],
      },
      {
        name: 'Acompañantes',
        products: [
          {
            name: 'Papas Fritas',
            description: 'Porción de papas doradas con sal marina.',
            price: 2.5,
            options: [
              {
                name: 'Tamaño',
                isRequired: true,
                minSelect: 1,
                maxSelect: 1,
                choices: [{ name: 'Mediana' }, { name: 'Grande', extraPrice: 1.0 }],
              },
            ],
          },
          {
            name: 'Aros de Cebolla',
            description: '8 aros de cebolla empanizados.',
            price: 3.0,
          },
        ],
      },
      {
        name: 'Bebidas',
        products: [
          { name: 'Limonada', description: 'Limonada natural 500ml.', price: 1.75 },
          { name: 'Gaseosa', description: 'Cola o lima-limón 400ml.', price: 1.25 },
        ],
      },
    ],
  },
  {
    ownerEmail: 'maria@test.com',
    ownerName: 'María Pizzas',
    name: 'Pizzería Napoli',
    description: 'Pizza al horno de leña, receta italiana tradicional.',
    lat: CUENCA.lat - 0.003,
    lng: CUENCA.lng + 0.002,
    phone: '0999000002',
    deliveryTime: 35,
    deliveryFee: 2.0,
    categories: [
      {
        name: 'Pizzas',
        products: [
          {
            name: 'Margarita',
            description: 'Salsa de tomate, mozzarella fresca y albahaca.',
            price: 8.0,
            options: [
              {
                name: 'Tamaño',
                isRequired: true,
                minSelect: 1,
                maxSelect: 1,
                choices: [
                  { name: 'Personal' },
                  { name: 'Mediana', extraPrice: 3.0 },
                  { name: 'Familiar', extraPrice: 6.0 },
                ],
              },
            ],
          },
          {
            name: 'Pepperoni',
            description: 'Doble pepperoni y extra queso.',
            price: 9.5,
          },
          {
            name: 'Cuatro Quesos',
            description: 'Mozzarella, parmesano, gorgonzola y provolone.',
            price: 10.0,
            discountPct: 15,
          },
        ],
      },
      {
        name: 'Entradas',
        products: [
          { name: 'Pan al Ajo', description: 'Con mantequilla de ajo y perejil.', price: 3.5 },
          { name: 'Ensalada César', description: 'Lechuga, crotones, parmesano y aderezo.', price: 4.5 },
        ],
      },
    ],
  },
  {
    ownerEmail: 'kenji@test.com',
    ownerName: 'Kenji Sushi',
    name: 'Sushi Zen',
    description: 'Sushi fresco y cocina japonesa contemporánea.',
    lat: CUENCA.lat + 0.004,
    lng: CUENCA.lng - 0.003,
    phone: '0999000003',
    deliveryTime: 40,
    deliveryFee: 2.5,
    categories: [
      {
        name: 'Rolls',
        products: [
          {
            name: 'California Roll',
            description: 'Cangrejo, aguacate y pepino (8 piezas).',
            price: 7.0,
            options: [
              {
                name: 'Salsa extra',
                maxSelect: 2,
                choices: [
                  { name: 'Soya', extraPrice: 0 },
                  { name: 'Teriyaki', extraPrice: 0.5 },
                  { name: 'Spicy mayo', extraPrice: 0.5 },
                ],
              },
            ],
          },
          {
            name: 'Tempura Roll',
            description: 'Camarón tempura, aguacate y salsa de anguila (8 piezas).',
            price: 8.5,
          },
        ],
      },
      {
        name: 'Platos calientes',
        products: [
          { name: 'Ramen Tonkotsu', description: 'Caldo de cerdo, fideos, huevo y chashu.', price: 9.0 },
          { name: 'Yakisoba', description: 'Fideos salteados con vegetales y pollo.', price: 7.5 },
        ],
      },
    ],
  },
];

// Valores de cada catálogo (antes eran enums).
const CATALOGOS = {
  roles: ['CLIENTE', 'VENDEDOR', 'ADMIN', 'REPARTIDOR'],
  estadosPedido: [
    'PENDIENTE',
    'CONFIRMADO',
    'EN_PREPARACION',
    'LISTO',
    'EN_CAMINO',
    'ENTREGADO',
    'CANCELADO',
    'RECHAZADO',
  ],
  tiposEntrega: ['DELIVERY', 'PICKUP'],
  metodosPago: [
    'EFECTIVO',
    'TARJETA_CREDITO',
    'TARJETA_DEBITO',
    'TRANSFERENCIA',
    'PAYPAL',
    'STRIPE',
  ],
  estadosPago: ['PENDIENTE', 'COMPLETADO', 'FALLIDO', 'REEMBOLSADO'],
  tiposTag: ['COMIDA', 'RESTAURANTE'],
};

async function main() {
  console.log('🌱 Iniciando seed…');

  // 0) Catálogos (tablas que reemplazaron a los enums). Idempotente por `nombre`.
  const upsertCatalogo = async (
    model: { upsert: (args: any) => Promise<any> },
    nombres: string[],
  ) => {
    for (const nombre of nombres) {
      await model.upsert({ where: { nombre }, update: {}, create: { nombre } });
    }
  };
  await upsertCatalogo(prisma.rol, CATALOGOS.roles);
  await upsertCatalogo(prisma.estadoPedido, CATALOGOS.estadosPedido);
  await upsertCatalogo(prisma.tipoEntrega, CATALOGOS.tiposEntrega);
  await upsertCatalogo(prisma.metodoPago, CATALOGOS.metodosPago);
  await upsertCatalogo(prisma.estadoPago, CATALOGOS.estadosPago);
  await upsertCatalogo(prisma.tipoTag, CATALOGOS.tiposTag);
  console.log('  📚 Catálogos poblados');

  // Mapa nombre-de-rol -> id, para asignar rolId a los usuarios.
  const roles = await prisma.rol.findMany();
  const rolIdByName: Record<string, number> = Object.fromEntries(
    roles.map((r) => [r.nombre, r.id]),
  );

  // 1) Usuarios (upsert por email con contraseña hasheada).
  const hashed = await bcrypt.hash(PASSWORD, 10);
  const usersByEmail: Record<string, string> = {};
  for (const u of USERS) {
    const rolId = rolIdByName[u.role];
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, rolId, phone: u.phone },
      create: { name: u.name, email: u.email, password: hashed, rolId, phone: u.phone },
    });
    usersByEmail[u.email] = user.id;
    console.log(`  👤 ${u.email} (${u.role})`);
  }

  // 1a) Casa (punto de entrega fijo) de los clientes de prueba.
  for (const h of CLIENT_HOMES) {
    const userId = usersByEmail[h.email];
    if (!userId) continue;
    await prisma.user.update({
      where: { id: userId },
      data: { homeLat: h.lat, homeLng: h.lng },
    });
    console.log(`  🏠 ${h.email} — casa fijada`);
  }

  // 1b) Perfiles de repartidor (disponibles, con ubicación inicial cerca de Cuenca).
  for (const d of DRIVERS) {
    const userId = usersByEmail[d.email];
    await prisma.driverProfile.upsert({
      where: { userId },
      update: { isAvailable: true, currentLat: d.lat, currentLng: d.lng, locationUpdatedAt: new Date() },
      create: { userId, isAvailable: true, currentLat: d.lat, currentLng: d.lng, locationUpdatedAt: new Date() },
    });
    console.log(`  🛵 ${d.email} — disponible`);
  }

  // 2) Restaurantes con categorías y productos.
  for (const r of RESTAURANTS) {
    const ownerId = usersByEmail[r.ownerEmail];

    const restaurant = await prisma.restaurant.upsert({
      where: { ownerId },
      update: {
        name: r.name,
        description: r.description,
        latitude: r.lat,
        longitude: r.lng,
        isOpen: true,
        isActive: true,
      },
      create: {
        ownerId,
        name: r.name,
        description: r.description,
        street: 'Av. Solano y Remigio Crespo',
        city: 'Cuenca',
        province: 'Azuay',
        latitude: r.lat,
        longitude: r.lng,
        phone: r.phone,
        deliveryTime: r.deliveryTime,
        deliveryFee: r.deliveryFee,
        minOrder: 3,
        rating: 4.3 + Math.random() * 0.6,
        totalReviews: 10 + Math.floor(Math.random() * 90),
        coverUrl: `https://placehold.co/800x400/E85D26/FFFFFF/png?text=${encodeURIComponent(r.name)}`,
      },
    });

    // Idempotencia: si el restaurante ya tiene categorías, se omite el menú.
    const existingCats = await prisma.category.count({
      where: { restaurantId: restaurant.id },
    });
    if (existingCats > 0) {
      console.log(`  🏪 ${r.name} — ya tenía menú, omitido`);
      continue;
    }

    // Horarios: abierto lunes a domingo 10:00–22:00.
    await prisma.restaurantSchedule.createMany({
      data: Array.from({ length: 7 }).map((_, day) => ({
        restaurantId: restaurant.id,
        dayOfWeek: day,
        openTime: '10:00',
        closeTime: '22:00',
        isClosed: false,
      })),
    });

    let sortCat = 0;
    for (const c of r.categories) {
      const category = await prisma.category.create({
        data: {
          restaurantId: restaurant.id,
          name: c.name,
          sortOrder: sortCat++,
        },
      });

      let sortProd = 0;
      for (const p of c.products) {
        const product = await prisma.product.create({
          data: {
            restaurantId: restaurant.id,
            categoryId: category.id,
            name: p.name,
            description: p.description,
            price: p.price,
            discountPct: p.discountPct ?? 0,
            sortOrder: sortProd++,
            imageUrl: `https://placehold.co/300x300/FEF0EA/E85D26/png?text=${encodeURIComponent(
              p.name.slice(0, 10),
            )}`,
          },
        });

        for (const opt of p.options ?? []) {
          await prisma.productOption.create({
            data: {
              productId: product.id,
              name: opt.name,
              isRequired: opt.isRequired ?? false,
              minSelect: opt.minSelect ?? 0,
              maxSelect: opt.maxSelect ?? 1,
              choices: {
                create: opt.choices.map((ch) => ({
                  name: ch.name,
                  extraPrice: ch.extraPrice ?? 0,
                })),
              },
            },
          });
        }
      }
    }
    console.log(`  🏪 ${r.name} — ${r.categories.length} categorías creadas`);
  }

  console.log('✅ Seed completado.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
