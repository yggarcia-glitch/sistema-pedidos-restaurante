import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { DeliveryType } from '../../common/enums/delivery-type.enum';

export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  addressId?: string;

  @IsOptional()
  @IsEnum(DeliveryType, { message: 'deliveryType debe ser DELIVERY o PICKUP' })
  deliveryType?: DeliveryType;

  @IsOptional()
  @IsString()
  notes?: string;
}
