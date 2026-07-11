import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { DriversService } from '../drivers/drivers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly driversService: DriversService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENTE)
  create(@GetUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(userId, dto);
  }

  @Get()
  findAll(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findAll(userId, userRole, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.ordersService.findOne(id, userId, userRole);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.VENDEDOR, Role.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.ordersService.updateStatus(id, dto, userId, userRole);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENTE)
  cancel(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.ordersService.cancel(id, userId);
  }

  @Patch(':id/accept-driver')
  @UseGuards(RolesGuard)
  @Roles(Role.REPARTIDOR)
  acceptDriver(@Param('id') id: string, @GetUser('id') driverId: string) {
    return this.driversService.acceptOrder(id, driverId);
  }

  @Patch(':id/reject-driver')
  @UseGuards(RolesGuard)
  @Roles(Role.REPARTIDOR)
  rejectDriver(@Param('id') id: string, @GetUser('id') driverId: string) {
    return this.driversService.rejectOrder(id, driverId);
  }

  @Patch(':id/pickup')
  @UseGuards(RolesGuard)
  @Roles(Role.REPARTIDOR)
  pickup(@Param('id') id: string, @GetUser('id') driverId: string) {
    return this.driversService.confirmPickup(id, driverId);
  }

  @Patch(':id/deliver')
  @UseGuards(RolesGuard)
  @Roles(Role.REPARTIDOR)
  deliver(@Param('id') id: string, @GetUser('id') driverId: string) {
    return this.driversService.confirmDelivery(id, driverId);
  }
}
