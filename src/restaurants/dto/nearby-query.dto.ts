import { IsLatitude, IsLongitude, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyQueryDto {
  @IsLatitude()
  @Type(() => Number)
  lat: number;

  @IsLongitude()
  @Type(() => Number)
  lng: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Type(() => Number)
  radiusKm?: number = 5;
}
