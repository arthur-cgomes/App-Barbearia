import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserTypeEnum } from 'src/common/enum/user-type.enum';
import { IsCpf } from '../../common/validators/is-cpf.validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome do usuário',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Data de nascimento do usuário',
    type: Date,
  })
  @IsNotEmpty()
  @IsDate()
  birthdate: Date;

  @ApiProperty({
    description: 'CPF do usuário',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @IsCpf()
  document: string;

  @ApiProperty({
    description: 'Email do usuário',
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Número de celular do usuário',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  cellphone: string;

  @ApiProperty({
    description: 'Tipo do usuário',
    enum: UserTypeEnum,
    enumName: 'UserTypeEnum',
  })
  @IsOptional()
  @IsEnum(UserTypeEnum)
  userType: UserTypeEnum;
}
