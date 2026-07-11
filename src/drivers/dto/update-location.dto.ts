import { IsLatitude, IsLongitude } from 'class-validator';

export class UpdateLocationDto {
  @IsLatitude({ message: 'Latitud inválida' })
  lat: number;

  @IsLongitude({ message: 'Longitud inválida' })
  lng: number;
}
