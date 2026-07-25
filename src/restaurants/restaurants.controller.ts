import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { ReviewsService } from '../reviews/reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FindRestaurantsQueryDto } from './dto/find-restaurants-query.dto';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import { RestaurantScheduleDto } from './dto/restaurant-schedule.dto';

@Controller('restaurants')
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDEDOR, Role.ADMIN)
  create(
    @Body() dto: CreateRestaurantDto,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.restaurantsService.create(dto, userId, userRole);
  }

  @Get()
  findAll(@Query() query: FindRestaurantsQueryDto) {
    return this.restaurantsService.findAll(query);
  }

  // IMPORTANTE: 'nearby' debe definirse ANTES que ':id' para no ser capturado como param
  @Get('nearby')
  findNearby(@Query() query: NearbyQueryDto) {
    return this.restaurantsService.findNearby(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDEDOR, Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantDto,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.restaurantsService.update(id, dto, userId, userRole);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.restaurantsService.remove(id);
  }

  @Patch(':id/toggle-open')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDEDOR)
  toggleOpen(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.restaurantsService.toggleOpen(id, userId, userRole);
  }

  // ─── Horarios ─────────────────────────────────────────────────────────────

  @Post(':id/schedules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDEDOR)
  setSchedules(
    @Param('id') restaurantId: string,
    @Body() dto: RestaurantScheduleDto,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.restaurantsService.setSchedules(restaurantId, dto, userId, userRole);
  }

  @Get(':id/schedules')
  getSchedules(@Param('id') restaurantId: string) {
    return this.restaurantsService.getSchedules(restaurantId);
  }

  // ─── Reseñas ──────────────────────────────────────────────────────────────

  @Get(':id/reviews')
  getReviews(
    @Param('id') restaurantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.findByRestaurant(restaurantId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }
}
