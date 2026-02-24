import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsCnpj } from '../../common/validators/is-cnpj.validator';

export class CreateBarberShopDto {
  @ApiProperty({
    description: 'Nome da barbearia',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'CNPJ da barbearia',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @IsCnpj()
  document: string;

  @ApiProperty({
    description: 'Endereço da barbearia',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Latitude da barbearia',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  lat: number;

  @ApiProperty({
    description: 'Longitude da barbearia',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  long: number;

  @ApiProperty({
    description: 'Número da barbearia',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  cellphone: string;

  @ApiProperty({
    description: 'Email da barbearia',
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
