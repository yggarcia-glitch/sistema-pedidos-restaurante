import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import { OrderStatus } from '../common/enums/order-status.enum';
import { DeliveryType } from '../common/enums/delivery-type.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';

// Estados que un VENDEDOR puede asignar (no puede entregar ni cancelar manualmente)
const VENDOR_ALLOWED_STATUSES: string[] = [
  OrderStatus.CONFIRMADO,
  OrderStatus.EN_PREPARACION,
  OrderStatus.LISTO,
  OrderStatus.RECHAZADO,
];

// Selección estándar de un catálogo { id, nombre }.
const CATALOGO = { select: { id: true, nombre: true } };

// Include reutilizable con los catálogos anidados como objetos.
const ORDER_DETAIL_INCLUDE = {
  items: { include: { choices: true } },
  statusHistory: { orderBy: { changedAt: 'asc' as const }, include: { estado: CATALOGO } },
  payment: { include: { metodo: CATALOGO, estado: CATALOGO } },
  restaurant: { select: { id: true, name: true, ownerId: true, logoUrl: true } },
  address: true,
  estado: CATALOGO,
  tipoEntrega: CATALOGO,
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers para resolver el nombre de catálogo a su id (FK) ────────────────
  private async estadoPedidoId(nombre: string): Promise<number> {
    const e = await this.prisma.estadoPedido.findUnique({ where: { nombre } });
    if (!e) throw new BadRequestException(`Estado de pedido inválido: ${nombre}`);
    return e.id;
  }

  private async tipoEntregaId(nombre: string): Promise<number> {
    const t = await this.prisma.tipoEntrega.findUnique({ where: { nombre } });
    if (!t) throw new BadRequestException(`Tipo de entrega inválido: ${nombre}`);
    return t.id;
  }

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

    const tipoEntregaNombre = dto.deliveryType ?? DeliveryType.DELIVERY;
    const deliveryFee =
      tipoEntregaNombre === DeliveryType.PICKUP ? 0 : Number(restaurant.deliveryFee);
    const total = subtotal + deliveryFee;

    if (subtotal < Number(restaurant.minOrder)) {
      throw new BadRequestException(
        `El pedido mínimo para este restaurante es $${restaurant.minOrder}`,
      );
    }

    // Resuelve los catálogos a FK antes de la transacción.
    const estadoPendienteId = await this.estadoPedidoId(OrderStatus.PENDIENTE);
    const tipoEntregaIdVal = await this.tipoEntregaId(tipoEntregaNombre);

    // Transacción: crear orden + items con snapshot + historial + vaciar carrito
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          clientId: userId,
          restaurantId: cart.restaurantId!,
          addressId: dto.addressId,
          estadoId: estadoPendienteId,
          tipoEntregaId: tipoEntregaIdVal,
          subtotal,
          deliveryFee,
          discount: 0,
          total,
          notes: dto.notes,
          estimatedTime: restaurant.deliveryTime,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name, // snapshot inmutable
              quantity: item.quantity,
              unitPrice: item.unitPrice, // snapshot al precio de compra
              subtotal: Number(item.unitPrice) * item.quantity,
              notes: item.notes,
              choices: {
                create: item.choices.map((c) => ({
                  choiceId: c.choiceId,
                  choiceName: c.choice.name, // snapshot
                  extraPrice: c.choice.extraPrice, // snapshot
                })),
              },
            })),
          },
          statusHistory: {
            create: { estadoId: estadoPendienteId, changedBy: userId },
          },
        },
        include: ORDER_DETAIL_INCLUDE,
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
          payment: { include: { metodo: CATALOGO, estado: CATALOGO } },
          restaurant: { select: { id: true, name: true, logoUrl: true } },
          address: true,
          estado: CATALOGO,
          tipoEntrega: CATALOGO,
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
      include: ORDER_DETAIL_INCLUDE,
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

    const nuevoEstadoId = await this.estadoPedidoId(dto.status);

    return this.prisma.$transaction(async (tx) => {
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          estadoId: nuevoEstadoId,
          note: dto.note,
          changedBy: userId,
        },
      });

      const deliveredAt =
        dto.status === OrderStatus.ENTREGADO ? new Date() : undefined;

      return tx.order.update({
        where: { id },
        data: { estadoId: nuevoEstadoId, ...(deliveredAt && { deliveredAt }) },
        include: {
          items: { include: { choices: true } },
          statusHistory: { orderBy: { changedAt: 'asc' }, include: { estado: CATALOGO } },
          estado: CATALOGO,
          tipoEntrega: CATALOGO,
        },
      });
    });
  }

  async cancel(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { estado: CATALOGO },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    if (order.clientId !== userId) {
      throw new ForbiddenException('No puedes cancelar este pedido');
    }
    if (order.estado.nombre !== OrderStatus.PENDIENTE) {
      throw new BadRequestException('Solo puedes cancelar pedidos en estado PENDIENTE');
    }

    const canceladoId = await this.estadoPedidoId(OrderStatus.CANCELADO);

    return this.prisma.$transaction(async (tx) => {
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          estadoId: canceladoId,
          changedBy: userId,
        },
      });
      return tx.order.update({
        where: { id },
        data: { estadoId: canceladoId },
        include: { estado: CATALOGO, tipoEntrega: CATALOGO },
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
