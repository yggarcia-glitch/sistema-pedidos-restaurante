import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// Controlador sin prefijo base; rutas definidas con path completo
@Controller('')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('restaurants/:restaurantId/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDEDOR, Role.ADMIN)
  create(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateProductDto,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.productsService.create(restaurantId, dto, userId, userRole);
  }

  @Get('restaurants/:restaurantId/products')
  findAll(
    @Param('restaurantId') restaurantId: string,
    @Query('categoryId') categoryId?: string,
    @Query('isAvailable') isAvailableRaw?: string,
  ) {
    const isAvailable =
      isAvailableRaw === 'true' ? true
      : isAvailableRaw === 'false' ? false
      : undefined;
    return this.productsService.findAll(restaurantId, { categoryId, isAvailable });
  }

  @Get('products/:id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDEDOR, Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.productsService.update(id, dto, userId, userRole);
  }

  @Patch('products/:id/toggle-availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDEDOR, Role.ADMIN)
  toggleAvailability(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.productsService.toggleAvailability(id, userId, userRole);
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDEDOR, Role.ADMIN)
  remove(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.productsService.remove(id, userId, userRole);
  }
}
