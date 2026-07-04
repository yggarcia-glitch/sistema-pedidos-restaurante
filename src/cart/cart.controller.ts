import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '../common/enums/role.enum';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateCartItemDto } from './dto/update-item.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENTE)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@GetUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  addItem(@GetUser('id') userId: string, @Body() dto: AddItemDto) {
    return this.cartService.addItem(userId, dto);
  }

  @Patch('items/:id')
  updateItem(
    @GetUser('id') userId: string,
    @Param('id') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, itemId, dto);
  }

  @Delete('items/:id')
  removeItem(@GetUser('id') userId: string, @Param('id') itemId: string) {
    return this.cartService.removeItem(userId, itemId);
  }

  @Delete()
  clearCart(@GetUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
