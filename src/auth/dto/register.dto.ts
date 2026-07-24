import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';

// Roles que un usuario puede elegir para sí mismo al registrarse.
// ADMIN queda deliberadamente fuera: solo un ADMIN existente puede otorgar
// ese rol, vía PATCH /users/:id (ver users.service.ts).
export const PUBLIC_REGISTRABLE_ROLES = [
  Role.CLIENTE,
  Role.VENDEDOR,
  Role.REPARTIDOR,
] as const;

export class RegisterDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  name: string;

  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(PUBLIC_REGISTRABLE_ROLES, {
    message: 'Rol inválido. Valores: CLIENTE, VENDEDOR, REPARTIDOR',
  })
  role?: Role;
}
