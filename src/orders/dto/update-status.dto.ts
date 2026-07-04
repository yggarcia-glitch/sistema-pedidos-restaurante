import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../../common/enums/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: `status debe ser uno de: ${Object.values(OrderStatus).join(', ')}`,
  })
  status: OrderStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
