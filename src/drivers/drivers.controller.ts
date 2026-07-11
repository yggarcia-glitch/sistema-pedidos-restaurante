import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '../common/enums/role.enum';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.REPARTIDOR)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get('me')
  getMe(@GetUser('id') userId: string) {
    return this.driversService.getOrCreateProfile(userId);
  }

  @Patch('me/availability')
  setAvailability(@GetUser('id') userId: string, @Body() dto: SetAvailabilityDto) {
    return this.driversService.setAvailability(userId, dto.isAvailable);
  }

  @Patch('me/location')
  updateLocation(@GetUser('id') userId: string, @Body() dto: UpdateLocationDto) {
    return this.driversService.updateLocation(userId, dto.lat, dto.lng);
  }

  @Get('me/current-order')
  getCurrentOrder(@GetUser('id') userId: string) {
    return this.driversService.getCurrentOrder(userId);
  }
}
