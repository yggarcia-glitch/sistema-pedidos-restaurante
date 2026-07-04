import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard) // Todas las rutas requieren autenticación
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users  — solo ADMIN
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  // GET /api/users/:id  — ADMIN o el propio usuario
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser('id') requesterId: string,
    @GetUser('role') requesterRole: string,
  ) {
    return this.usersService.findOne(id, requesterId, requesterRole);
  }

  // PATCH /api/users/:id  — ADMIN o el propio usuario
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @GetUser('id') requesterId: string,
    @GetUser('role') requesterRole: string,
  ) {
    return this.usersService.update(id, dto, requesterId, requesterRole);
  }

  // DELETE /api/users/:id  — solo ADMIN
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
