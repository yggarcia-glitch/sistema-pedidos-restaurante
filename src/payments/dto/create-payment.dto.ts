import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { PaymentMethod } from '../../common/enums/payment-method.enum';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @IsEnum(PaymentMethod, {
    message: `method debe ser uno de: ${Object.values(PaymentMethod).join(', ')}`,
  })
  method: PaymentMethod;
}
