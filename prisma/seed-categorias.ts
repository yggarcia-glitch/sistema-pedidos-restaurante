import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

// Categorías genéricas globales (restaurantId null). Disponibles para todos los
// restaurantes automáticamente. Seguro para producción: NO crea usuarios ni
// restaurantes de prueba, solo estas categorías. Idempotente por nombre.
const GLOBAL_CATEGORIES = [
  'Entradas',
  'Platos fuertes',
  'Sopas',
  'Acompañantes',
  'Ensaladas',
  'Bebidas',
  'Postres',
  'Combos',
];

async function main() {
  console.log('🌐 Sembrando categorías genéricas globales…');
  let creadas = 0;
  for (let i = 0; i < GLOBAL_CATEGORIES.length; i++) {
    const name = GLOBAL_CATEGORIES[i];
    const existing = await prisma.category.findFirst({
      where: { restaurantId: null, name },
    });
    if (existing) {
      console.log(`  · ${name} — ya existía`);
      continue;
    }
    await prisma.category.create({
      data: { restaurantId: null, name, sortOrder: i },
    });
    creadas++;
    console.log(`  + ${name}`);
  }
  console.log(
    `✅ Listo. ${creadas} creadas, ${GLOBAL_CATEGORIES.length - creadas} ya existían.`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Error sembrando categorías globales:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
