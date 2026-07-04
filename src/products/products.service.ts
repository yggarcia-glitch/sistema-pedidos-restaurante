import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  /**
   * Crea producto con opciones y choices en una transacción atómica.
   * Si falla cualquier opción/choice, toda la operación se revierte.
   */
  async create(
    restaurantId: string,
    dto: CreateProductDto,
    userId: string,
    userRole: string,
  ) {
    await this.restaurantsService.verifyOwnership(restaurantId, userId, userRole);
    const { options, ...productData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          discountPct: productData.discountPct ?? 0,
          imageUrl: productData.imageUrl,
          restaurantId,
          categoryId: productData.categoryId,
        },
      });

      if (options?.length) {
        for (const opt of options) {
          await tx.productOption.create({
            data: {
              name: opt.name,
              isRequired: opt.isRequired ?? false,
              minSelect: opt.minSelect ?? 0,
              maxSelect: opt.maxSelect ?? 1,
              productId: product.id,
              choices: {
                create: opt.choices.map((c) => ({
                  name: c.name,
                  extraPrice: c.extraPrice ?? 0,
                })),
              },
            },
          });
        }
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          options: { include: { choices: true } },
          category: true,
        },
      });
    });
  }

  async findAll(
    restaurantId: string,
    query: { categoryId?: string; isAvailable?: boolean },
  ) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurante no encontrado');

    const where: any = { restaurantId, isActive: true };
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.isAvailable !== undefined) where.isAvailable = query.isAvailable;

    return this.prisma.product.findMany({
      where,
      include: {
        options: { include: { choices: true } },
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        options: { include: { choices: true } },
        category: true,
        tags: { include: { tag: true } },
        restaurant: { select: { id: true, name: true, logoUrl: true } },
      },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async update(id: string, dto: UpdateProductDto, userId: string, userRole: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    await this.restaurantsService.verifyOwnership(
      product.restaurantId,
      userId,
      userRole,
    );
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { options: { include: { choices: true } }, category: true },
    });
  }

  async toggleAvailability(id: string, userId: string, userRole: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    await this.restaurantsService.verifyOwnership(
      product.restaurantId,
      userId,
      userRole,
    );
    return this.prisma.product.update({
      where: { id },
      data: { isAvailable: !product.isAvailable },
      select: { id: true, name: true, isAvailable: true },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    await this.restaurantsService.verifyOwnership(
      product.restaurantId,
      userId,
      userRole,
    );
    return this.prisma.product.delete({ where: { id } });
  }
}
