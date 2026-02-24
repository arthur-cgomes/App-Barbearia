import { ApiProperty } from '@nestjs/swagger';
import { BaseCollection } from '../../common/entity/base.entity';
import { Service } from '../../service/entity/service.entity';
import { User } from '../../user/entity/user.entity';
import { Barber } from '../../barber/entity/barber.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { BarberShop } from '../../barber-shop/entity/barber-shop.entity';
import { SchedulingStatus } from '../../common/enum/scheduling-status.enum';

@Entity()
export class Scheduling extends BaseCollection {
  @ApiProperty({
    description: 'Data e hora do agendamento',
    type: Date,
  })
  @Column({ type: 'timestamp', default: null, nullable: true })
  date: Date;

  @ApiProperty({
    description: 'Data e hora de término do agendamento',
    type: Date,
  })
  @Column({ type: 'timestamp', default: null, nullable: true })
  endTime: Date;

  @ApiProperty({
    description: 'Status do agendamento',
    enum: SchedulingStatus,
    enumName: 'SchedulingStatus',
  })
  @Column({
    type: 'enum',
    enum: SchedulingStatus,
    default: SchedulingStatus.PENDING,
  })
  status: SchedulingStatus;

  @ApiProperty({
    description: 'Relacionamento com a tabela User',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.schedulings)
  user: User;

  @ApiProperty({
    description: 'Relacionamento com a tabela BarberShop',
    type: () => BarberShop,
  })
  @ManyToOne(() => BarberShop, (barbershop) => barbershop.scheduling)
  barbershop: BarberShop;

  @ApiProperty({
    description: 'Relacionamento com a tabela Barber',
    type: () => Barber,
  })
  @ManyToOne(() => Barber, (barber) => barber.schedulings)
  barber: Barber;

  @ApiProperty({
    description: 'Relacionamento com a tabela Services',
    type: () => Service,
  })
  @ManyToMany(() => Service, (service) => service.scheduling)
  @JoinTable({ name: 'scheduling_services' })
  services: Service[];
}
