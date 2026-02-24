import { BaseCollection } from '../../common/entity/base.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Scheduling } from '../../scheduling/entity/scheduling.entity';
import { BarberShop } from '../../barber-shop/entity/barber-shop.entity';
import { ServiceType } from '../../common/enum/service-type.enum';

@Entity()
export class Service extends BaseCollection {
  @ApiProperty({
    description: 'Nome do serviço',
    type: String,
  })
  @Column({ type: 'varchar', default: null, nullable: true })
  name: string;

  @ApiProperty({
    description: 'Tipo do serviço',
    enum: ServiceType,
    enumName: 'ServiceType',
  })
  @Column({ type: 'enum', enum: ServiceType, default: ServiceType.HAIR })
  type: ServiceType;

  @ApiProperty({
    description: 'Preço do serviço',
    type: Number,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: null,
    nullable: true,
  })
  price: number;

  @ApiProperty({
    description: 'Duração do serviço em minutos',
    type: Number,
    nullable: true,
  })
  @Column({ type: 'int', default: null, nullable: true })
  durationMinutes: number;

  @ApiProperty({
    description: 'Relacionamento com a tabela BarberShop',
    type: () => BarberShop,
  })
  @ManyToMany(() => BarberShop, (barberShop) => barberShop.services)
  @JoinTable({ name: 'barbershop_services' })
  barberShop: BarberShop[];

  @ApiProperty({
    description: 'Relacionamento com a tabela Scheduling',
    type: () => Scheduling,
  })
  @ManyToMany(() => Scheduling, (scheduling) => scheduling.services)
  scheduling: Scheduling[];
}
