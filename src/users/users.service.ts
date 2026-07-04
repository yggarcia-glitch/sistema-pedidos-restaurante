import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../common/enums/role.enum';

// Nunca retornar password ni refreshToken
const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Solo ADMIN
  async findAll() {
    return this.prisma.user.findMany({
      select: SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ADMIN o el propio usuario
  async findOne(id: string, requesterId: string, requesterRole: string) {
    this.verificarAcceso(id, requesterId, requesterRole);

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: SAFE_SELECT,
    });

    if (!user) {
      throw new NotFoundException(`Usuario con id "${id}" no encontrado`);
    }

    return user;
  }

  // ADMIN o el propio usuario
  async update(
    id: string,
    dto: UpdateUserDto,
    requesterId: string,
    requesterRole: string,
  ) {
    this.verificarAcceso(id, requesterId, requesterRole);

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id "${id}" no encontrado`);
    }

    const data: any = { ...dto };

    // Solo ADMIN puede cambiar el rol o desactivar usuarios
    if (requesterRole !== Role.ADMIN) {
      delete data.role;
      delete data.isActive;
    }

    // Si se cambia la contraseña, hashearla
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: SAFE_SELECT,
    });
  }

  // Solo ADMIN
  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id "${id}" no encontrado`);
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: `Usuario "${user.name}" eliminado correctamente` };
  }

  // Solo ADMIN o el propio usuario pueden operar
  private verificarAcceso(
    targetId: string,
    requesterId: string,
    requesterRole: string,
  ) {
    if (requesterId !== targetId && requesterRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'No tienes permiso para realizar esta acción',
      );
    }
  }
}
