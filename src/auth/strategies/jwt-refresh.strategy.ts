import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      ignoreExpiration: false,
      passReqToCallback: true, // Necesario para acceder al token crudo desde el request
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token no encontrado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { rol: { select: { id: true, nombre: true } } },
    });

    if (!user || !user.refreshToken || !user.isActive) {
      throw new UnauthorizedException('Acceso denegado');
    }

    // Comparar el token recibido con el hash almacenado en la BD
    const tokenValido = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenValido) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const { password, refreshToken: _, ...safeUser } = user;
    // Expone `role` como string para @GetUser('role') en el refresh.
    return { ...safeUser, role: user.rol.nombre };
  }
}
