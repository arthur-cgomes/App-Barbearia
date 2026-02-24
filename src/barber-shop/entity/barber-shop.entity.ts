import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entity/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { BaseCollection } from '../../common/entity/base.entity';
import { Scheduling } from '../../scheduling/entity/scheduling.entity';
import { Barber } from '../../barber/entity/barber.entity';
import { Service } from '../../service/entity/service.entity';

@Entity()
export class BarberShop extends BaseCollection {
  @ApiProperty({
    description: 'Nome da barbearia',
    type: String,
  })
  @Column({ type: 'varchar', default: null, nullable: true })
  name: string;

  @ApiProperty({
    description: 'CNPJ da barbearia',
    type: String,
  })
  @Column({ type: 'varchar', default: null, nullable: true })
  document: string;

  @ApiProperty({
    description: 'Endereço da barbearia',
    type: String,
  })
  @Column({ type: 'varchar', default: null, nullable: true })
  address: string;

  @ApiProperty({
    description: 'Latitude da barbearia',
    type: Number,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    default: null,
    nullable: true,
  })
  lat: number;

  @ApiProperty({
    description: 'Longitude da barbearia',
    type: Number,
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    default: null,
    nullable: true,
  })
  long: number;

  @ApiProperty({
    description: 'Número da barbearia',
    type: String,
  })
  @Column({ type: 'varchar', default: null, nullable: true })
  cellphone: string;

  @ApiProperty({
    description: 'Email da barbearia',
    type: String,
  })
  @Column({ type: 'varchar', default: null, nullable: true })
  email: string;

  @ApiProperty({
    description: 'Relacionamento com a tabela User',
    type: () => User,
  })
  @OneToMany(() => User, (user) => user.barbershops)
  user: User[];

  @ApiProperty({
    description: 'Relacionamento com a tabela Scheduling',
    type: () => Scheduling,
  })
  @OneToMany(() => Scheduling, (scheduling) => scheduling.barbershop)
  scheduling: Scheduling[];

  @ApiProperty({
    description: 'Relacionamento com a tabela Barber',
    type: () => Barber,
  })
  @ManyToMany(() => Barber, (barber) => barber.barbershop)
  @JoinTable({ name: 'barbershop_barbers' })
  barber: Barber[];

  @ApiProperty({
    description: 'Relacionamento com a tabela Services',
    type: () => Service,
    isArray: true,
  })
  @ManyToMany(() => Service, (services) => services.barberShop)
  services: Service[];

  @BeforeInsert()
  @BeforeUpdate()
  format = () => {
    if (this.cellphone) this.cellphone = this.cellphone.replace(/[^\d]+/g, '');
  };
}
