import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password?: string;

  // Solo ADMIN puede modificar el rol (validado en el servicio)
  @IsOptional()
  @IsEnum(Role, { message: 'Rol inválido. Valores: CLIENTE, VENDEDOR, ADMIN' })
  role?: Role;

  // Solo ADMIN puede activar/desactivar usuarios
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
