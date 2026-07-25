import {
  IsEmail,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRestaurantDto {
  // Solo lo usa un ADMIN, para asignar el restaurante a un vendedor específico.
  // Si lo manda un VENDEDOR, se ignora y se usa su propio id (ver service).
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsLatitude()
  @Type(() => Number)
  latitude: number;

  @IsLongitude()
  @Type(() => Number)
  longitude: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  deliveryTime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  deliveryFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minOrder?: number;
}
