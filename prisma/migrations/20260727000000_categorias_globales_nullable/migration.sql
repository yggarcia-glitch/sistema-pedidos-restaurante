-- Categorías genéricas globales: se permite restaurantId nulo.
-- Una categoría con restaurantId NULL es global (compartida por todos los
-- restaurantes); con valor es propia del restaurante.
ALTER TABLE "categories" ALTER COLUMN "restaurantId" DROP NOT NULL;
