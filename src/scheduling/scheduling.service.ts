import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BarberShopService } from '../barber-shop/barber-shop.service';
import { ServicesService } from '../service/service.service';
import { UserService } from '../user/user.service';
import { FindManyOptions, LessThan, MoreThan, Repository } from 'typeorm';
import { Scheduling } from './entity/scheduling.entity';
import { CreateSchedulingDto } from './dto/create-scheduling.dto';
import { GetAllSchedulingResponseDto } from './dto/get-all-scheduling-response.dto';
import { UpdateSchedulingDto } from './dto/update-scheduling.dto';
import { BarberService } from '../barber/barber.service';
import { AuditService } from '../common/audit/audit.service';
import { SchedulingStatus } from '../common/enum/scheduling-status.enum';
import { UserTypeEnum } from '../common/enum/user-type.enum';

@Injectable()
export class SchedulingService {
  constructor(
    private readonly userService: UserService,
    private readonly barbershopService: BarberShopService,
    private readonly barberService: BarberService,
    private readonly servicesService: ServicesService,
    @InjectRepository(Scheduling)
    private readonly schedulingRepository: Repository<Scheduling>,
    private readonly auditService: AuditService,
  ) {}

  public async createScheduling(
    createSchedulingDto: CreateSchedulingDto,
  ): Promise<Scheduling> {
    const [user, barbershop, barber, service] = await Promise.all([
      this.userService.getUserById(createSchedulingDto.userId),
      this.barbershopService.getBarberShopById(
        createSchedulingDto.barberShopId,
      ),
      this.barberService.getBarberById(createSchedulingDto.barberId),
      this.servicesService.getServiceById(createSchedulingDto.serviceId),
    ]);

    const appointmentStart = new Date(createSchedulingDto.date);
    const durationMs = (service.durationMinutes ?? 60) * 60 * 1000;
    const appointmentEnd = new Date(appointmentStart.getTime() + durationMs);

    const checkScheduling = await this.schedulingRepository.findOne({
      where: [
        {
          barbershop: { id: createSchedulingDto.barberShopId },
          barber: { id: createSchedulingDto.barberId },
          date: MoreThan(new Date(appointmentStart.getTime() - durationMs)),
          endTime: LessThan(appointmentEnd),
        },
      ],
    });

    if (checkScheduling) {
      throw new ConflictException('time not available');
    }

    const scheduling = new Scheduling();
    scheduling.user = user;
    scheduling.barbershop = barbershop;
    scheduling.barber = barber;
    scheduling.services = [service];
    scheduling.date = appointmentStart;
    scheduling.endTime = appointmentEnd;
    scheduling.status = SchedulingStatus.PENDING;

    const saved = await this.schedulingRepository.create(scheduling).save();
    this.auditService.log('SCHEDULING_CREATED', user.id, {
      schedulingId: saved.id,
      barbershopId: barbershop.id,
      barberId: barber.id,
      date: saved.date,
    });
    return saved;
  }

  public async updateScheduling(
    schedulingId: string,
    updateSchedulingDto: UpdateSchedulingDto,
  ): Promise<Scheduling> {
    await this.getSchedulingById(schedulingId);

    const preloaded = await this.schedulingRepository.preload({
      id: schedulingId,
      ...updateSchedulingDto,
    });

    if (!preloaded) {
      throw new NotFoundException('scheduling with this id not found');
    }

    return await preloaded.save();
  }

  public async getSchedulingById(schedulingId: string): Promise<Scheduling> {
    const scheduling = await this.schedulingRepository.findOne({
      where: { id: schedulingId },
    });

    if (!scheduling) {
      throw new NotFoundException('scheduling with this id not found');
    }

    return scheduling;
  }

  public async getAllSchedulings(
    take: number,
    skip: number,
    sort: string,
    order: 'ASC' | 'DESC',
    userId?: string,
    barberId?: string,
    barberShopId?: string,
    status?: SchedulingStatus,
    requesterUserId?: string,
    requesterRole?: UserTypeEnum,
  ): Promise<GetAllSchedulingResponseDto> {
    const conditions: FindManyOptions<Scheduling> = {
      take,
      skip,
      order: {
        [sort]: order,
      },
      where: {},
    };

    // RBAC: regular users only see their own schedulings
    if (requesterRole === UserTypeEnum.USER && requesterUserId) {
      conditions.where = {
        ...(conditions.where as object),
        user: { id: requesterUserId },
      };
    } else if (userId) {
      conditions.where = {
        ...(conditions.where as object),
        user: { id: userId },
      };
    }

    if (barberId) {
      conditions.where = {
        ...(conditions.where as object),
        barber: { id: barberId },
      };
    }

    if (barberShopId) {
      conditions.where = {
        ...(conditions.where as object),
        barbershop: { id: barberShopId },
      };
    }

    if (status) {
      conditions.where = {
        ...(conditions.where as object),
        status,
      };
    }

    const [scheduling, count] =
      await this.schedulingRepository.findAndCount(conditions);

    if (scheduling.length === 0) {
      return { skip: null, total: 0, schedulings: [] };
    }
    const over = count - Number(take) - Number(skip);
    skip = over <= 0 ? null : Number(skip) + Number(take);

    return { skip, total: count, schedulings: scheduling };
  }

  public async deleteSchedulingById(schedulingId: string): Promise<string> {
    const deleteScheduling = await this.getSchedulingById(schedulingId);
    deleteScheduling.active = false;
    deleteScheduling.status = SchedulingStatus.CANCELLED;
    await this.schedulingRepository.softRemove(deleteScheduling);
    this.auditService.log('SCHEDULING_CANCELLED', schedulingId, {
      date: deleteScheduling.date,
    });

    return 'removed';
  }
}
