import { Module } from '@nestjs/common';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { ReviewsService } from '../reviews/reviews.service';

@Module({
  controllers: [RestaurantsController],
  providers: [RestaurantsService, ReviewsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
