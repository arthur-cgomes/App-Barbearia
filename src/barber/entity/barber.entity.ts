import { ApiProperty } from '@nestjs/swagger';
import { BarberShop } from '../../barber-shop/entity/barber-shop.entity';
import { BaseCollection } from '../../common/entity/base.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  Unique,
} from 'typeorm';
import { Scheduling } from '../../scheduling/entity/scheduling.entity';

@Entity()
@Unique(['email', 'document'])
export class Barber extends BaseCollection {
  @ApiProperty({
    description: 'Nome do barbeiro',
    type: String,
  })
  @Column({ type: 'varchar', default: null, nullable: true })
  name: string;

  @ApiProperty({
    description: 'CPF do barbeiro',
    type: String,
  })
  @Column({ length: 11, default: null, nullable: true })
  document: string;

  @ApiProperty({
    description: 'Email do barbeiro',
    type: String,
  })
  @Column({ type: 'varchar', default: null, nullable: true })
  email: string;

  @ApiProperty({
    description: 'Número de celular do barbeiro',
    type: String,
  })
  @Column({ type: 'varchar', default: null, nullable: true })
  cellphone: string;

  @ApiProperty({
    description: 'Relacionamento com a tabela BarberShop',
    type: () => BarberShop,
  })
  @ManyToMany(() => BarberShop, (barbershop) => barbershop.barber)
  barbershop: BarberShop[];

  @ApiProperty({
    description: 'Relacionamento com a tabela Scheduling',
    type: () => Scheduling,
    isArray: true,
  })
  @OneToMany(() => Scheduling, (scheduling) => scheduling.barber)
  schedulings: Scheduling[];

  @BeforeInsert()
  @BeforeUpdate()
  format = () => {
    if (this.cellphone) this.cellphone = this.cellphone.replace(/[^\d]+/g, '');
  };
}
