import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// Las opciones/choices se gestionan por separado; no se actualizan en este endpoint
export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['options'] as const),
) {}
