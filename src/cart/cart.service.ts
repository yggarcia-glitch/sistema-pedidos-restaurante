import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateCartItemDto } from './dto/update-item.dto';

const ITEM_INCLUDE = {
  product: {
    select: { id: true, name: true, price: true, imageUrl: true, isAvailable: true },
  },
  choices: { include: { choice: true } },
};

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: { include: ITEM_INCLUDE, orderBy: { createdAt: 'asc' } },
        restaurant: {
          select: { id: true, name: true, deliveryFee: true, minOrder: true },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: { include: ITEM_INCLUDE },
          restaurant: {
            select: { id: true, name: true, deliveryFee: true, minOrder: true },
          },
        },
      });
    }

    return cart;
  }

  async addItem(userId: string, dto: AddItemDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (!product.isAvailable || !product.isActive) {
      throw new BadRequestException('Producto no disponible');
    }

    // Precio con descuento aplicado al momento de agregar al carrito
    const unitPrice =
      product.discountPct > 0
        ? Number(product.price) * (1 - product.discountPct / 100)
        : Number(product.price);

    let cart = await this.prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId, restaurantId: product.restaurantId },
      });
    } else if (cart.restaurantId && cart.restaurantId !== product.restaurantId) {
      // Producto de otro restaurante: limpiar carrito y actualizar restaurantId
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      cart = await this.prisma.cart.update({
        where: { id: cart.id },
        data: { restaurantId: product.restaurantId },
      });
    } else if (!cart.restaurantId) {
      cart = await this.prisma.cart.update({
        where: { id: cart.id },
        data: { restaurantId: product.restaurantId },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.create({
        data: {
          cartId: cart!.id,
          productId: dto.productId,
          quantity: dto.quantity,
          unitPrice,
          notes: dto.notes,
        },
      });

      if (dto.choiceIds?.length) {
        await tx.cartItemChoice.createMany({
          data: dto.choiceIds.map((choiceId) => ({
            cartItemId: item.id,
            choiceId,
          })),
        });
      }

      return tx.cartItem.findUnique({
        where: { id: item.id },
        include: ITEM_INCLUDE,
      });
    });
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Carrito no encontrado');

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('Ítem no encontrado en el carrito');

    if (dto.quantity === 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
      return { message: 'Ítem eliminado del carrito' };
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
      include: ITEM_INCLUDE,
    });
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Carrito no encontrado');

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('Ítem no encontrado en el carrito');

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return { message: 'Ítem eliminado del carrito' };
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) return { message: 'El carrito ya está vacío' };

    await this.prisma.$transaction([
      this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
      this.prisma.cart.update({ where: { id: cart.id }, data: { restaurantId: null } }),
    ]);

    return { message: 'Carrito vaciado correctamente' };
  }
}
