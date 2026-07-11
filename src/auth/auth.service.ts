import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from '../common/enums/role.enum';

// Campos seguros que se retornan al cliente (nunca password ni refreshToken).
// El rol se devuelve como objeto { id, nombre } (tabla `roles`).
const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  rol: { select: { id: true, nombre: true } },
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existe = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existe) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Resuelve el rol (string) a su fila en la tabla `roles`.
    const rolNombre = dto.role ?? Role.CLIENTE;
    const rol = await this.prisma.rol.findUnique({
      where: { nombre: rolNombre },
    });
    if (!rol) {
      throw new BadRequestException(`Rol inválido: ${rolNombre}`);
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
        rolId: rol.id,
      },
      select: SAFE_SELECT,
    });

    if (rolNombre === Role.REPARTIDOR) {
      await this.prisma.driverProfile.create({
        data: { userId: user.id },
      });
    }

    const tokens = await this.generarTokens(user.id, user.email, user.rol.nombre);
    await this.guardarRefreshToken(user.id, tokens.refreshToken);

    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { rol: { select: { id: true, nombre: true } } },
    });

    // Mensaje genérico para no revelar si el email existe
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(dto.password, user.password);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password, refreshToken, rolId, ...safeUser } = user;

    const tokens = await this.generarTokens(user.id, user.email, user.rol.nombre);
    await this.guardarRefreshToken(user.id, tokens.refreshToken);

    return { user: safeUser, ...tokens };
  }

  async refresh(userId: string, email: string, role: string) {
    const tokens = await this.generarTokens(userId, email, role);
    await this.guardarRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Sesión cerrada correctamente' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: SAFE_SELECT,
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  // Genera access token (15min) y refresh token (7d)
  private async generarTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // Hashea el refresh token antes de persistirlo (seguridad ante robo de BD)
  private async guardarRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashed },
    });
  }
}
