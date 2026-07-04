import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductOptionChoiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  extraPrice?: number = 0;
}

export class ProductOptionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean = false;

  @IsOptional()
  @IsInt()
  @Min(0)
  minSelect?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxSelect?: number = 1;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionChoiceDto)
  choices: ProductOptionChoiceDto[];
}
