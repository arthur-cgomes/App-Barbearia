import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Data de nascimento do usuário',
    type: Date,
  })
  @IsNotEmpty()
  @IsDateString()
  birthdate: Date;

  @ApiProperty({
    description: 'CPF do usuário',
    type: String,
  })
  @IsNotEmpty()
  @Length(11, 11)
  document: string;

  @ApiProperty({
    description: 'Nova senha do usuário',
    type: String,
  })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
