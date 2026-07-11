import { IsBoolean } from 'class-validator';

export class SetAvailabilityDto {
  @IsBoolean({ message: 'isAvailable debe ser booleano' })
  isAvailable: boolean;
}
