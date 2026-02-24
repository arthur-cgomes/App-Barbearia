import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ServiceType } from '../../common/enum/service-type.enum';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Nome do serviço',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Tipo do serviço',
    enum: ServiceType,
    enumName: 'ServiceType',
  })
  @IsNotEmpty()
  @IsEnum(ServiceType)
  type: ServiceType;

  @ApiProperty({
    description: 'Preço do serviço',
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Duração do serviço em minutos',
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiProperty({
    description: 'Id da barbearia',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  barberShopId: string;
}
