import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseCollection } from '../../common/entity/base.entity';
import { BarberShop } from './barber-shop.entity';

@Entity('barbershop_business_hours')
export class BusinessHours extends BaseCollection {
  @ApiProperty({
    description: 'Dia da semana (0=Domingo, 6=Sábado)',
    type: Number,
  })
  @Column({ type: 'int' })
  dayOfWeek: number;

  @ApiProperty({
    description: 'Horário de abertura (formato HH:mm)',
    type: String,
  })
  @Column({ type: 'varchar', length: 5 })
  openTime: string;

  @ApiProperty({
    description: 'Horário de fechamento (formato HH:mm)',
    type: String,
  })
  @Column({ type: 'varchar', length: 5 })
  closeTime: string;

  @ApiProperty({
    description: 'Indica se a barbearia abre nesse dia',
    type: Boolean,
  })
  @Column({ type: 'bool', default: true })
  isOpen: boolean;

  @ApiProperty({
    description: 'Barbearia relacionada',
    type: () => BarberShop,
  })
  @ManyToOne(() => BarberShop, { onDelete: 'CASCADE' })
  barbershop: BarberShop;
}
