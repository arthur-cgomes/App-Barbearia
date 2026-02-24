import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ServiceType } from '../../common/enum/service-type.enum';

export class UpdateServiceDto {
  @ApiProperty({
    description: 'Nome do serviço',
    type: String,
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Tipo do serviço',
    enum: ServiceType,
    enumName: 'ServiceType',
  })
  @IsOptional()
  @IsEnum(ServiceType)
  type: ServiceType;

  @ApiProperty({
    description: 'Preço do serviço',
    type: Number,
  })
  @IsOptional()
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
}
