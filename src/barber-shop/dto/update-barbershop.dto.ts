import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBarberShopDto {
  @ApiProperty({
    description: 'Nome da barbearia',
    type: String,
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'CNPJ da barbearia',
    type: String,
  })
  @IsOptional()
  @IsString()
  document: string;

  @ApiProperty({
    description: 'Endereço da barbearia',
    type: String,
  })
  @IsOptional()
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
  @IsOptional()
  @IsString()
  cellphone: string;

  @ApiProperty({
    description: 'Email da barbearia',
    type: String,
  })
  @IsOptional()
  @IsEmail()
  email: string;
}
