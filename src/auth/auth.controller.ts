import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';

// Límite estricto para endpoints sensibles a fuerza bruta / spam de cuentas.
const AUTH_THROTTLE = { default: { ttl: 60_000, limit: 5 } };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/register
  @Post('register')
  @Throttle(AUTH_THROTTLE)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // POST /api/auth/login
  @Post('login')
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // POST /api/auth/refresh  — requiere refreshToken en Authorization header
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  refresh(
    @GetUser('id') userId: string,
    @GetUser('email') email: string,
    @GetUser('role') role: string,
  ) {
    return this.authService.refresh(userId, email, role);
  }

  // POST /api/auth/logout
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(@GetUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  // GET /api/auth/me
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}
