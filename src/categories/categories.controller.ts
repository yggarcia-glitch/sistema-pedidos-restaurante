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
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

// Controlador sin prefijo base; rutas definidas con path completo
@Controller('')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('restaurants/:restaurantId/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDEDOR, Role.ADMIN)
  create(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateCategoryDto,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.categoriesService.create(restaurantId, dto, userId, userRole);
  }

  @Get('restaurants/:restaurantId/categories')
  findAll(@Param('restaurantId') restaurantId: string) {
    return this.categoriesService.findAll(restaurantId);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDEDOR, Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.categoriesService.update(id, dto, userId, userRole);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDEDOR, Role.ADMIN)
  remove(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.categoriesService.remove(id, userId, userRole);
  }
}
