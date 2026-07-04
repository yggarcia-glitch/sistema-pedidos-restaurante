import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async create(
    restaurantId: string,
    dto: CreateCategoryDto,
    userId: string,
    userRole: string,
  ) {
    await this.restaurantsService.verifyOwnership(restaurantId, userId, userRole);
    return this.prisma.category.create({
      data: { ...dto, restaurantId },
    });
  }

  async findAll(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurante no encontrado');

    return this.prisma.category.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async update(id: string, dto: UpdateCategoryDto, userId: string, userRole: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    await this.restaurantsService.verifyOwnership(
      category.restaurantId,
      userId,
      userRole,
    );
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string, userRole: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    await this.restaurantsService.verifyOwnership(
      category.restaurantId,
      userId,
      userRole,
    );
    return this.prisma.category.delete({ where: { id } });
  }
}
