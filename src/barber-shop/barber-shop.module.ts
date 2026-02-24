import { BarberShopController } from './barber-shop.controller';
import { BarberShopService } from './barber-shop.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarberShop } from './entity/barber-shop.entity';
import { BusinessHours } from './entity/business-hours.entity';
import { PassportModule } from '@nestjs/passport';
import { BarberModule } from '../barber/barber.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BarberShop, BusinessHours]),
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    BarberModule,
  ],
  controllers: [BarberShopController],
  providers: [BarberShopService],
  exports: [BarberShopService],
})
export class BarberShopModule {}
