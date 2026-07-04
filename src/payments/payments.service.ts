import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';

// Selección estándar de un catálogo { id, nombre }.
const CATALOGO = { select: { id: true, nombre: true } };

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers para resolver el nombre de catálogo a su id (FK) ────────────────
  private async metodoPagoId(nombre: string): Promise<number> {
    const m = await this.prisma.metodoPago.findUnique({ where: { nombre } });
    if (!m) throw new BadRequestException(`Método de pago inválido: ${nombre}`);
    return m.id;
  }

  private async estadoPagoId(nombre: string): Promise<number> {
    const e = await this.prisma.estadoPago.findUnique({ where: { nombre } });
    if (!e) throw new BadRequestException(`Estado de pago inválido: ${nombre}`);
    return e.id;
  }

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

    const metodoId = await this.metodoPagoId(dto.method);
    const estadoId = await this.estadoPagoId(PaymentStatus.PENDIENTE);

    return this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        userId,
        metodoId,
        estadoId,
        amount: order.total,
      },
      include: { metodo: CATALOGO, estado: CATALOGO },
    });
  }

  async findByOrderId(orderId: string, userId: string, userRole: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      include: {
        order: { select: { clientId: true } },
        metodo: CATALOGO,
        estado: CATALOGO,
      },
    });
    if (!payment) throw new NotFoundException('Pago no encontrado');

    if (userRole !== Role.ADMIN && payment.order.clientId !== userId) {
      throw new ForbiddenException('No tienes acceso a este pago');
    }

    return payment;
  }

  async confirm(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { estado: CATALOGO },
    });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    if (payment.estado.nombre === PaymentStatus.COMPLETADO) {
      throw new BadRequestException('El pago ya fue confirmado');
    }

    const completadoId = await this.estadoPagoId(PaymentStatus.COMPLETADO);

    return this.prisma.payment.update({
      where: { id },
      data: { estadoId: completadoId, paidAt: new Date() },
      include: { metodo: CATALOGO, estado: CATALOGO },
    });
  }
}
