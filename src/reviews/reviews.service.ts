import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import { OrderStatus } from '../common/enums/order-status.enum';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: dto.restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurante no encontrado');

    // Solo se puede reseñar si existe un pedido ENTREGADO en ese restaurante
    const pedidoEntregado = await this.prisma.order.findFirst({
      where: {
        clientId: userId,
        restaurantId: dto.restaurantId,
        estado: { nombre: OrderStatus.ENTREGADO },
      },
    });
    if (!pedidoEntregado) {
      throw new BadRequestException(
        'Solo puedes reseñar restaurantes donde tengas un pedido entregado',
      );
    }

    const review = await this.prisma.review.create({
      data: {
        userId,
        restaurantId: dto.restaurantId,
        orderId: dto.orderId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    // Actualizar rating y totalReviews denormalizados en el restaurante
    await this.recalcularRating(dto.restaurantId);
    return review;
  }

  async findByRestaurant(
    restaurantId: string,
    query: { page?: number; limit?: number },
  ) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurante no encontrado');

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { restaurantId },
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { restaurantId } }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async remove(id: string, userId: string, userRole: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Reseña no encontrada');

    if (userRole !== Role.ADMIN && review.userId !== userId) {
      throw new ForbiddenException('No puedes eliminar esta reseña');
    }

    await this.prisma.review.delete({ where: { id } });
    // Recalcular métricas tras eliminar la reseña
    await this.recalcularRating(review.restaurantId);
    return { message: 'Reseña eliminada correctamente' };
  }

  // Recalcula y persiste rating promedio y totalReviews en el restaurante
  private async recalcularRating(restaurantId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { restaurantId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        rating: agg._avg.rating ?? 0,
        totalReviews: agg._count.rating,
      },
    });
  }
}
