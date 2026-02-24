import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, ILike, Repository } from 'typeorm';
import { CreateServiceDto } from './dto/create-service.dto';
import { GetAllServicesResponseDto } from './dto/get-all-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entity/service.entity';
import { AuditService } from '../common/audit/audit.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
    private readonly auditService: AuditService,
  ) {}

  public async createService(
    createServiceDto: CreateServiceDto,
  ): Promise<Service> {
    const checkService = await this.servicesRepository.findOne({
      where: {
        name: createServiceDto.name,
        barberShop: { id: createServiceDto.barberShopId },
      },
    });

    if (checkService) {
      throw new ConflictException('services with that name already exists');
    }

    return await this.servicesRepository.create({ ...createServiceDto }).save();
  }

  public async updateService(
    serviceId: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    await this.getServiceById(serviceId);

    const preloaded = await this.servicesRepository.preload({
      id: serviceId,
      ...updateServiceDto,
    });

    if (!preloaded) {
      throw new NotFoundException('service with this id not found');
    }

    return await preloaded.save();
  }

  public async getServiceById(serviceId: string): Promise<Service> {
    const service = await this.servicesRepository.findOne({
      where: { id: serviceId },
    });

    if (!service) throw new NotFoundException('service with this id not found');

    return service;
  }

  public async getAllServices(
    take: number,
    skip: number,
    sort: string,
    order: 'ASC' | 'DESC',
    barberShopId?: string,
    search?: string,
  ): Promise<GetAllServicesResponseDto> {
    const conditions: FindManyOptions<Service> = {
      take,
      skip,
      order: {
        [sort]: order,
      },
      where: {},
    };

    if (barberShopId) {
      conditions.where = {
        ...(conditions.where as object),
        barberShop: { id: barberShopId },
      };
    }

    if (search) {
      conditions.where = {
        ...(conditions.where as object),
        name: ILike('%' + search + '%'),
      };
    }

    const [services, count] =
      await this.servicesRepository.findAndCount(conditions);

    if (services.length === 0) {
      return { skip: null, total: 0, services };
    }
    const over = count - Number(take) - Number(skip);
    skip = over <= 0 ? null : Number(skip) + Number(take);

    return { skip, total: count, services };
  }

  public async deleteServiceById(serviceId: string): Promise<string> {
    const deleteService = await this.getServiceById(serviceId);
    deleteService.active = false;
    await this.servicesRepository.softRemove(deleteService);

    return 'removed';
  }
}
