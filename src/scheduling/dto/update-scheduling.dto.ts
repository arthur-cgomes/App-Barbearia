import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { SchedulingStatus } from '../../common/enum/scheduling-status.enum';

export class UpdateSchedulingDto {
  @ApiProperty({
    description: 'Id da barbearia',
    type: String,
  })
  @IsOptional()
  @IsString()
  barberShopId: string;

  @ApiProperty({
    description: 'Id do barbeiro',
    type: String,
  })
  @IsOptional()
  @IsString()
  barberId: string;

  @ApiProperty({
    description: 'Id do serviço',
    type: String,
  })
  @IsOptional()
  @IsString()
  serviceId: string;

  @ApiProperty({
    description: 'Data e hora do agendamento',
    type: Date,
  })
  @IsOptional()
  @IsDate()
  date: Date;

  @ApiProperty({
    description: 'Status do agendamento',
    enum: SchedulingStatus,
    enumName: 'SchedulingStatus',
    required: false,
  })
  @IsOptional()
  @IsEnum(SchedulingStatus)
  status?: SchedulingStatus;
}
