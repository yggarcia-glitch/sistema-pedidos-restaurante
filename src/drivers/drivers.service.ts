import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '../common/enums/order-status.enum';
import { DeliveryType } from '../common/enums/delivery-type.enum';
import {
  ACTIVE_DRIVER_STATUSES,
  DriverOrderStatus,
} from '../common/enums/driver-order-status.enum';
import { haversineDistance } from '../common/utils/geo.util';

const CATALOGO = { select: { id: true, nombre: true } };

const CURRENT_ORDER_INCLUDE = {
  items: { include: { choices: true } },
  restaurant: {
    select: { id: true, name: true, phone: true, latitude: true, longitude: true, logoUrl: true },
  },
  address: true,
  client: { select: { id: true, name: true, phone: true } },
  estado: CATALOGO,
  tipoEntrega: CATALOGO,
};

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateProfile(userId: string) {
    const existing = await this.prisma.driverProfile.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.driverProfile.create({ data: { userId } });
  }

  async setAvailability(userId: string, isAvailable: boolean) {
    if (!isAvailable) {
      const activeOrder = await this.prisma.order.findFirst({
        where: { driverId: userId, driverStatus: { in: ACTIVE_DRIVER_STATUSES } },
      });
      if (activeOrder) {
        throw new BadRequestException(
          'No puedes desconectarte mientras tienes un pedido activo',
        );
      }
    }

    await this.getOrCreateProfile(userId);
    const profile = await this.prisma.driverProfile.update({
      where: { userId },
      data: { isAvailable },
    });

    if (isAvailable) {
      await this.assignPendingOrders();
    }

    return profile;
  }

  async updateLocation(userId: string, lat: number, lng: number) {
    await this.getOrCreateProfile(userId);
    return this.prisma.driverProfile.update({
      where: { userId },
      data: { currentLat: lat, currentLng: lng, locationUpdatedAt: new Date() },
    });
  }

  async getCurrentOrder(userId: string) {
    return this.prisma.order.findFirst({
      where: { driverId: userId, driverStatus: { in: ACTIVE_DRIVER_STATUSES } },
      include: CURRENT_ORDER_INCLUDE,
      orderBy: { updatedAt: 'desc' },
    });
  }

  // Busca, entre los repartidores disponibles y libres, el más cercano al restaurante
  // del pedido, y se lo asigna. No hace nada si no hay candidatos.
  async assignNearestDriver(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true, tipoEntrega: CATALOGO },
    });
    if (!order) return null;
    if (order.tipoEntrega.nombre !== DeliveryType.DELIVERY || !order.addressId) return null;
    if (order.driverId) return null; // ya asignado

    const candidates = await this.prisma.driverProfile.findMany({
      where: {
        isAvailable: true,
        currentLat: { not: null },
        currentLng: { not: null },
        userId: { notIn: order.rejectedDriverIds },
        user: {
          isActive: true,
          driverOrders: { none: { driverStatus: { in: ACTIVE_DRIVER_STATUSES } } },
        },
      },
    });

    if (candidates.length === 0) return null;

    const nearest = candidates
      .map((c) => ({
        ...c,
        distanceKm: haversineDistance(
          c.currentLat!,
          c.currentLng!,
          order.restaurant.latitude,
          order.restaurant.longitude,
        ),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0];

    return this.prisma.order.update({
      where: { id: orderId },
      data: { driverId: nearest.userId, driverStatus: DriverOrderStatus.ASIGNADO },
    });
  }

  // Se dispara cuando un repartidor se conecta: intenta asignarle pedidos LISTO sin repartidor.
  async assignPendingOrders() {
    const pending = await this.prisma.order.findMany({
      where: {
        driverId: null,
        estado: { nombre: OrderStatus.LISTO },
        tipoEntrega: { nombre: DeliveryType.DELIVERY },
      },
      select: { id: true },
    });

    for (const o of pending) {
      await this.assignNearestDriver(o.id);
    }
  }

  private async getAssignedOrder(orderId: string, driverId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    if (order.driverId !== driverId) {
      throw new ForbiddenException('Este pedido no está asignado a ti');
    }
    return order;
  }

  async acceptOrder(orderId: string, driverId: string) {
    const order = await this.getAssignedOrder(orderId, driverId);
    if (order.driverStatus !== DriverOrderStatus.ASIGNADO) {
      throw new BadRequestException('Este pedido ya no está pendiente de aceptación');
    }
    return this.prisma.order.update({
      where: { id: orderId },
      data: { driverStatus: DriverOrderStatus.ACEPTADO },
      include: CURRENT_ORDER_INCLUDE,
    });
  }

  async rejectOrder(orderId: string, driverId: string) {
    const order = await this.getAssignedOrder(orderId, driverId);
    if (order.driverStatus !== DriverOrderStatus.ASIGNADO) {
      throw new BadRequestException('Este pedido ya no está pendiente de aceptación');
    }
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        driverId: null,
        driverStatus: null,
        rejectedDriverIds: { push: driverId },
      },
    });
    return this.assignNearestDriver(orderId);
  }

  async confirmPickup(orderId: string, driverId: string) {
    const order = await this.getAssignedOrder(orderId, driverId);
    if (order.driverStatus !== DriverOrderStatus.ACEPTADO) {
      throw new BadRequestException('Debes aceptar el pedido antes de retirarlo');
    }

    const enCaminoId = await this.estadoPedidoId(OrderStatus.EN_CAMINO);

    return this.prisma.$transaction(async (tx) => {
      await tx.orderStatusHistory.create({
        data: { orderId, estadoId: enCaminoId, changedBy: driverId },
      });
      return tx.order.update({
        where: { id: orderId },
        data: {
          driverStatus: DriverOrderStatus.RETIRADO,
          pickedUpAt: new Date(),
          estadoId: enCaminoId,
        },
        include: CURRENT_ORDER_INCLUDE,
      });
    });
  }

  async confirmDelivery(orderId: string, driverId: string) {
    const order = await this.getAssignedOrder(orderId, driverId);
    if (order.driverStatus !== DriverOrderStatus.RETIRADO) {
      throw new BadRequestException('Debes retirar el pedido antes de entregarlo');
    }

    const entregadoId = await this.estadoPedidoId(OrderStatus.ENTREGADO);

    return this.prisma.$transaction(async (tx) => {
      await tx.orderStatusHistory.create({
        data: { orderId, estadoId: entregadoId, changedBy: driverId },
      });
      return tx.order.update({
        where: { id: orderId },
        data: {
          driverStatus: DriverOrderStatus.ENTREGADO,
          estadoId: entregadoId,
          deliveredAt: new Date(),
        },
        include: CURRENT_ORDER_INCLUDE,
      });
    });
  }

  private async estadoPedidoId(nombre: string): Promise<number> {
    const e = await this.prisma.estadoPedido.findUnique({ where: { nombre } });
    if (!e) throw new BadRequestException(`Estado de pedido inválido: ${nombre}`);
    return e.id;
  }
}
