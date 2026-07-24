-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

