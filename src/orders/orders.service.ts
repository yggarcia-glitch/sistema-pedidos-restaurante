import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import { OrderStatus } from '../common/enums/order-status.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';

// Estados que un VENDEDOR puede asignar (no puede entregar ni cancelar manualmente)
const VENDOR_ALLOWED_STATUSES: OrderStatus[] = [
  OrderStatus.CONFIRMADO,
  OrderStatus.EN_PREPARACION,
  OrderStatus.LISTO,
  OrderStatus.RECHAZADO,
];

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            choices: { include: { choice: true } },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }
    if (!cart.restaurantId) {
      throw new BadRequestException('El carrito no tiene restaurante asociado');
    }

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: cart.restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurante no encontrado');
    if (!restaurant.isOpen) throw new BadRequestException('El restaurante está cerrado');

    // Calcular subtotal: precio unitario × cantidad + extras × cantidad
    const subtotal = cart.items.reduce((acc, item) => {
      const extrasTotal = item.choices.reduce(
        (s, c) => s + Number(c.choice.extraPrice),
        0,
      );
      return acc + (Number(item.unitPrice) + extrasTotal) * item.quantity;
    }, 0);

    const deliveryFee =
      dto.deliveryType === 'PICKUP' ? 0 : Number(restaurant.deliveryFee);
    const total = subtotal + deliveryFee;

    if (subtotal < Number(restaurant.minOrder)) {
      throw new BadRequestException(
        `El pedido mínimo para este restaurante es $${restaurant.minOrder}`,
      );
    }

    // Transacción: crear orden + items con snapshot + historial + vaciar carrito
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          clientId: userId,
          restaurantId: cart.restaurantId!,
          addressId: dto.addressId,
          deliveryType: (dto.deliveryType as any) ?? 'DELIVERY',
          subtotal,
          deliveryFee,
          discount: 0,
          total,
          notes: dto.notes,
          estimatedTime: restaurant.deliveryTime,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,    // snapshot inmutable
              quantity: item.quantity,
              unitPrice: item.unitPrice,          // snapshot al precio de compra
              subtotal: Number(item.unitPrice) * item.quantity,
              notes: item.notes,
              choices: {
                create: item.choices.map((c) => ({
                  choiceId: c.choiceId,
                  choiceName: c.choice.name,        // snapshot
                  extraPrice: c.choice.extraPrice,  // snapshot
                })),
              },
            })),
          },
          statusHistory: {
            create: { status: OrderStatus.PENDIENTE as any, changedBy: userId },
          },
        },
        include: {
          items: { include: { choices: true } },
          statusHistory: true,
          restaurant: { select: { id: true, name: true, deliveryFee: true } },
          address: true,
        },
      });

      // Vaciar carrito tras confirmar el pedido
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({
        where: { id: cart.id },
        data: { restaurantId: null },
      });

      return newOrder;
    });

    return order;
  }

  async findAll(
    userId: string,
    userRole: string,
    query: { page?: number; limit?: number },
  ) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (userRole === Role.CLIENTE) {
      where.clientId = userId;
    } else if (userRole === Role.VENDEDOR) {
      const restaurant = await this.prisma.restaurant.findUnique({
        where: { ownerId: userId },
      });
      if (!restaurant) return { data: [], total: 0, page, totalPages: 0 };
      where.restaurantId = restaurant.id;
    }
    // ADMIN: sin filtro → todos los pedidos

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: { include: { choices: true } },
          payment: true,
          restaurant: { select: { id: true, name: true, logoUrl: true } },
          address: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string, userRole: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { choices: true } },
        statusHistory: { orderBy: { changedAt: 'asc' } },
        payment: true,
        restaurant: { select: { id: true, name: true, ownerId: true, logoUrl: true } },
        address: true,
      },
    });

    if (!order) throw new NotFoundException('Pedido no encontrado');
    this.checkOrderAccess(order, userId, userRole);
    return order;
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    userId: string,
    userRole: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { restaurant: { select: { ownerId: true } } },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');

    if (userRole === Role.VENDEDOR) {
      if (order.restaurant.ownerId !== userId) {
        throw new ForbiddenException('No eres el dueño de este restaurante');
      }
      if (!VENDOR_ALLOWED_STATUSES.includes(dto.status)) {
        throw new ForbiddenException(
          `Como vendedor puedes cambiar a: ${VENDOR_ALLOWED_STATUSES.join(', ')}`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: dto.status as any,
          note: dto.note,
          changedBy: userId,
        },
      });

      const deliveredAt =
        dto.status === OrderStatus.ENTREGADO ? new Date() : undefined;

      return tx.order.update({
        where: { id },
        data: { status: dto.status as any, ...(deliveredAt && { deliveredAt }) },
        include: {
          items: { include: { choices: true } },
          statusHistory: { orderBy: { changedAt: 'asc' } },
        },
      });
    });
  }

  async cancel(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    if (order.clientId !== userId) {
      throw new ForbiddenException('No puedes cancelar este pedido');
    }
    if (order.status !== (OrderStatus.PENDIENTE as any)) {
      throw new BadRequestException('Solo puedes cancelar pedidos en estado PENDIENTE');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: OrderStatus.CANCELADO as any,
          changedBy: userId,
        },
      });
      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELADO as any },
        select: { id: true, status: true, updatedAt: true },
      });
    });
  }

  private checkOrderAccess(order: any, userId: string, userRole: string) {
    if (userRole === Role.ADMIN) return;
    if (userRole === Role.CLIENTE && order.clientId === userId) return;
    if (userRole === Role.VENDEDOR && order.restaurant.ownerId === userId) return;
    throw new ForbiddenException('No tienes acceso a este pedido');
  }
}
