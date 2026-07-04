import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { payment: true },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    if (order.clientId !== userId) {
      throw new ForbiddenException('No eres el dueño de este pedido');
    }
    if (order.payment) {
      throw new BadRequestException('Este pedido ya tiene un pago registrado');
    }

    return this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        userId,
        method: dto.method as any,
        amount: order.total,
      },
    });
  }

  async findByOrderId(orderId: string, userId: string, userRole: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      include: { order: { select: { clientId: true } } },
    });
    if (!payment) throw new NotFoundException('Pago no encontrado');

    if (userRole !== Role.ADMIN && payment.order.clientId !== userId) {
      throw new ForbiddenException('No tienes acceso a este pago');
    }

    return payment;
  }

  async confirm(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    if (payment.status === 'COMPLETADO') {
      throw new BadRequestException('El pago ya fue confirmado');
    }

    return this.prisma.payment.update({
      where: { id },
      data: { status: 'COMPLETADO' as any, paidAt: new Date() },
    });
  }
}
