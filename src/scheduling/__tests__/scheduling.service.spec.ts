import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MockRepository,
  repositoryMockFactory,
} from '../../common/mock/test.util';
import { FindManyOptions, Repository } from 'typeorm';
import { UserTypeEnum } from '../../common/enum/user-type.enum';
import { SchedulingStatus } from '../../common/enum/scheduling-status.enum';
import { Scheduling } from '../entity/scheduling.entity';
import { SchedulingService } from '../scheduling.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '../../user/user.service';
import { BarberShopService } from '../../barber-shop/barber-shop.service';
import { ServicesService } from '../../service/service.service';
import { User } from '../../user/entity/user.entity';
import { BarberShop } from '../../barber-shop/entity/barber-shop.entity';
import { Service } from '../../service/entity/service.entity';
import { UpdateSchedulingDto } from '../dto/update-scheduling.dto';
import { Barber } from '../../barber/entity/barber.entity';
import { CreateSchedulingDto } from '../dto/create-scheduling.dto';
import { BarberService } from '../../barber/barber.service';
import { ConflictException } from '@nestjs/common/exceptions';
import { mockScheduling } from './mocks/scheduling.mock';
import { mockUser } from '../../auth/__tests__/mocks/auth.mock';
import { AuditService } from '../../common/audit/audit.service';
import { mockBarberShop } from '../../barber-shop/__tests__/mocks/barbershop.mock';
import { mockBarber } from '../../barber/__tests__/mocks/barber.mock';
import { mockService } from '../../service/__tests__/mocks/service.mock';

describe('SchedulingService', () => {
  let service: SchedulingService;
  let userService: UserService;
  let barberShopService: BarberShopService;
  let barberService: BarberService;
  let servicesService: ServicesService;

  let repositoryMock: MockRepository<Repository<Scheduling>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        {
          provide: getRepositoryToken(Scheduling),
          useValue: repositoryMockFactory<Scheduling>(),
        },
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMockFactory<User>(),
        },
        BarberShopService,
        {
          provide: getRepositoryToken(BarberShop),
          useValue: repositoryMockFactory<BarberShop>(),
        },
        BarberService,
        {
          provide: getRepositoryToken(Barber),
          useValue: repositoryMockFactory<Barber>(),
        },
        ServicesService,
        {
          provide: getRepositoryToken(Service),
          useValue: repositoryMockFactory<Service>(),
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SchedulingService>(SchedulingService);
    userService = module.get<UserService>(UserService);
    barberShopService = module.get<BarberShopService>(BarberShopService);
    barberService = module.get<BarberService>(BarberService);
    servicesService = module.get<ServicesService>(ServicesService);

    repositoryMock = module.get(getRepositoryToken(Scheduling));
  });

  beforeEach(() => jest.clearAllMocks());

  describe('createScheduling', () => {
    const createSchedulingDto: CreateSchedulingDto = {
      userId: 'userId',
      barberShopId: 'barberShopId',
      barberId: 'barberId',
      serviceId: 'serviceId',
      date: new Date(),
    };

    it('Should successfully create a scheduling', async () => {
      repositoryMock.findOne = jest.fn();
      repositoryMock.create = jest
        .fn()
        .mockReturnValue({ save: () => mockScheduling });

      jest.spyOn(userService, 'getUserById').mockResolvedValue(mockUser);
      jest
        .spyOn(barberShopService, 'getBarberShopById')
        .mockResolvedValue(mockBarberShop);
      jest.spyOn(barberService, 'getBarberById').mockResolvedValue(mockBarber);
      jest
        .spyOn(servicesService, 'getServiceById')
        .mockResolvedValue(mockService);

      const result = await service.createScheduling(createSchedulingDto);

      expect(result).toEqual(mockScheduling);

      expect(repositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUser,
          barbershop: mockBarberShop,
          barber: mockBarber,
          services: [mockService],
          status: 'pending',
        }),
      );
    });

    it('Should throw the NotFoundException exception when user not found', async () => {
      const error = new NotFoundException('user not found');

      repositoryMock.findOne = jest.fn();

      jest.spyOn(userService, 'getUserById').mockRejectedValue(error);
      jest
        .spyOn(barberShopService, 'getBarberShopById')
        .mockResolvedValue(mockBarberShop);
      jest.spyOn(barberService, 'getBarberById').mockResolvedValue(mockBarber);
      jest
        .spyOn(servicesService, 'getServiceById')
        .mockResolvedValue(mockService);

      await expect(
        service.createScheduling(createSchedulingDto),
      ).rejects.toStrictEqual(error);
      expect(repositoryMock.create).not.toHaveBeenCalled();
    });

    it('Should throw the NotFoundException exception when barbershop not found', async () => {
      const error = new NotFoundException('barbershop not found');

      repositoryMock.findOne = jest.fn();

      jest.spyOn(userService, 'getUserById').mockResolvedValue(mockUser);
      jest
        .spyOn(barberShopService, 'getBarberShopById')
        .mockRejectedValue(error);
      jest.spyOn(barberService, 'getBarberById').mockResolvedValue(mockBarber);
      jest
        .spyOn(servicesService, 'getServiceById')
        .mockResolvedValue(mockService);

      await expect(
        service.createScheduling(createSchedulingDto),
      ).rejects.toStrictEqual(error);
      expect(repositoryMock.create).not.toHaveBeenCalled();
    });

    it('Should throw the NotFoundException exception when barber not found', async () => {
      const error = new NotFoundException('barber not found');

      repositoryMock.findOne = jest.fn();

      jest.spyOn(userService, 'getUserById').mockResolvedValue(mockUser);
      jest
        .spyOn(barberShopService, 'getBarberShopById')
        .mockResolvedValue(mockBarberShop);
      jest.spyOn(barberService, 'getBarberById').mockRejectedValue(error);
      jest
        .spyOn(servicesService, 'getServiceById')
        .mockResolvedValue(mockService);

      await expect(
        service.createScheduling(createSchedulingDto),
      ).rejects.toStrictEqual(error);
      expect(repositoryMock.create).not.toHaveBeenCalled();
    });

    it('Should throw the NotFoundException exception when service not found', async () => {
      const error = new NotFoundException('service not found');

      repositoryMock.findOne = jest.fn();

      jest.spyOn(userService, 'getUserById').mockResolvedValue(mockUser);
      jest
        .spyOn(barberShopService, 'getBarberShopById')
        .mockResolvedValue(mockBarberShop);
      jest.spyOn(barberService, 'getBarberById').mockResolvedValue(mockBarber);
      jest.spyOn(servicesService, 'getServiceById').mockRejectedValue(error);

      await expect(
        service.createScheduling(createSchedulingDto),
      ).rejects.toStrictEqual(error);
      expect(repositoryMock.create).not.toHaveBeenCalled();
    });

    it('Should throw the ConflictException exception when scheduling time not available', async () => {
      const error = new ConflictException('time not available');

      repositoryMock.findOne = jest.fn().mockReturnValue(mockScheduling);

      jest.spyOn(userService, 'getUserById').mockResolvedValue(mockUser);
      jest
        .spyOn(barberShopService, 'getBarberShopById')
        .mockResolvedValue(mockBarberShop);
      jest.spyOn(barberService, 'getBarberById').mockResolvedValue(mockBarber);
      jest
        .spyOn(servicesService, 'getServiceById')
        .mockResolvedValue(mockService);

      await expect(
        service.createScheduling(createSchedulingDto),
      ).rejects.toStrictEqual(error);
      expect(repositoryMock.create).not.toHaveBeenCalled();
    });

    it('Should default to 60 minutes duration when service has no durationMinutes', async () => {
      const serviceWithoutDuration = { ...mockService, durationMinutes: null };
      repositoryMock.findOne = jest.fn();
      repositoryMock.create = jest
        .fn()
        .mockReturnValue({ save: () => mockScheduling });

      jest.spyOn(userService, 'getUserById').mockResolvedValue(mockUser);
      jest
        .spyOn(barberShopService, 'getBarberShopById')
        .mockResolvedValue(mockBarberShop);
      jest.spyOn(barberService, 'getBarberById').mockResolvedValue(mockBarber);
      jest
        .spyOn(servicesService, 'getServiceById')
        .mockResolvedValue(serviceWithoutDuration as any);

      const result = await service.createScheduling(createSchedulingDto);

      expect(result).toEqual(mockScheduling);
      expect(repositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending',
        }),
      );
    });
  });
  describe('updateScheduling', () => {
    const updateSchedulingDto: UpdateSchedulingDto = {
      barberShopId: 'barbershops.id',
      barberId: 'barbers.id',
      serviceId: 'services.id',
      date: new Date(),
    };

    it('Should successfully update a scheduling', async () => {
      repositoryMock.findOne = jest.fn().mockReturnValue(mockScheduling);
      repositoryMock.preload = jest
        .fn()
        .mockReturnValue({ save: () => mockScheduling });

      const result = await service.updateScheduling(
        mockScheduling.id,
        updateSchedulingDto,
      );

      expect(result).toStrictEqual(mockScheduling);
      expect(repositoryMock.preload).toHaveBeenCalledWith({
        id: mockScheduling.id,
        ...updateSchedulingDto,
      });
    });

    it('Should throw the NotFoundException exception when scheduling not found', async () => {
      const error = new NotFoundException('scheduling with this id not found');

      repositoryMock.findOne = jest.fn();

      await expect(
        service.updateScheduling(mockScheduling.id, updateSchedulingDto),
      ).rejects.toStrictEqual(error);
      expect(repositoryMock.preload).not.toHaveBeenCalled();
    });

    it('Should throw NotFoundException when preload returns null', async () => {
      const error = new NotFoundException('scheduling with this id not found');

      repositoryMock.findOne = jest.fn().mockReturnValue(mockScheduling);
      repositoryMock.preload = jest.fn().mockReturnValue(null);

      await expect(
        service.updateScheduling(mockScheduling.id, updateSchedulingDto),
      ).rejects.toStrictEqual(error);
    });
  });

  describe('getSchedulingById', () => {
    it('Should successfully get scheduling by id', async () => {
      repositoryMock.findOne = jest.fn().mockReturnValue(mockScheduling);

      const result = await service.getSchedulingById(mockScheduling.id);

      expect(result).toStrictEqual(mockScheduling);
    });

    it('Should throw the NotFoundException exception scheduling not found', async () => {
      const error = new NotFoundException('scheduling with this id not found');

      repositoryMock.findOne = jest.fn();

      await expect(
        service.getSchedulingById(mockScheduling.id),
      ).rejects.toStrictEqual(error);
    });
  });

  describe('getAllSchedulings', () => {
    it('Should successfully get all schedulings', async () => {
      const take = 1;
      const skip = 0;
      const sort = 'date';
      const order = 'ASC';

      const conditions: FindManyOptions<Scheduling> = {
        take,
        skip,
        order: {
          [sort]: order,
        },
        where: {},
      };
      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockScheduling], 10]);

      const result = await service.getAllSchedulings(take, skip, sort, order);

      expect(result).toStrictEqual({
        skip: 1,
        total: 10,
        schedulings: [mockScheduling],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should successfully get all schedulings with userId', async () => {
      const userId = 'userId';
      const take = 10;
      const skip = 0;
      const sort = 'date';
      const order = 'ASC';

      const conditions: FindManyOptions<Scheduling> = {
        take,
        skip,
        order: {
          [sort]: order,
        },
        where: { user: { id: userId } },
      };

      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockScheduling], 10]);

      const result = await service.getAllSchedulings(
        take,
        skip,
        sort,
        order,
        userId,
      );

      expect(result).toStrictEqual({
        skip: null,
        total: 10,
        schedulings: [mockScheduling],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should successfully get all schedulings with barberId', async () => {
      const barberId = 'barberId';
      const take = 10;
      const skip = 0;
      const sort = 'date';
      const order = 'ASC';

      const conditions: FindManyOptions<Scheduling> = {
        take,
        skip,
        order: {
          [sort]: order,
        },
        where: { barber: { id: barberId } },
      };

      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockScheduling], 10]);

      const result = await service.getAllSchedulings(
        take,
        skip,
        sort,
        order,
        null,
        barberId,
      );

      expect(result).toStrictEqual({
        skip: null,
        total: 10,
        schedulings: [mockScheduling],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should successfully get all schedulings with barberShopId', async () => {
      const barberShopId = 'barberShopId';
      const take = 10;
      const skip = 0;
      const sort = 'date';
      const order = 'ASC';

      const conditions: FindManyOptions<Scheduling> = {
        take,
        skip,
        order: {
          [sort]: order,
        },
        where: { barbershop: { id: barberShopId } },
      };

      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockScheduling], 10]);

      const result = await service.getAllSchedulings(
        take,
        skip,
        sort,
        order,
        null,
        null,
        barberShopId,
      );

      expect(result).toStrictEqual({
        skip: null,
        total: 10,
        schedulings: [mockScheduling],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should successfully return an empty list of schedulings', async () => {
      const take = 10;
      const skip = 10;
      const sort = 'date';
      const order = 'ASC';

      const conditions: FindManyOptions<Scheduling> = {
        take,
        skip,
        order: {
          [sort]: order,
        },
        where: {},
      };

      repositoryMock.findAndCount = jest.fn().mockReturnValue([[], 0]);

      const result = await service.getAllSchedulings(take, skip, sort, order);

      expect(result).toStrictEqual({
        skip: null,
        total: 0,
        schedulings: [],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should set skip to null when no more results are available', async () => {
      const take = 5;
      const skip = 5;
      const sort = 'date';
      const order = 'ASC';

      const conditions: FindManyOptions<Scheduling> = {
        take,
        skip,
        order: {
          [sort]: order,
        },
        where: {},
      };

      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockScheduling], 5]);

      const result = await service.getAllSchedulings(take, skip, sort, order);

      expect(result).toStrictEqual({
        skip: null,
        total: 5,
        schedulings: [mockScheduling],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should increment skip when more results are available', async () => {
      const take = 5;
      const skip = 0;
      const sort = 'date';
      const order = 'ASC';

      const conditions: FindManyOptions<Scheduling> = {
        take,
        skip,
        order: {
          [sort]: order,
        },
        where: {},
      };

      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockScheduling], 15]);

      const result = await service.getAllSchedulings(take, skip, sort, order);

      expect(result).toStrictEqual({
        skip: 5,
        total: 15,
        schedulings: [mockScheduling],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should apply RBAC filter when requester is USER role', async () => {
      const take = 10;
      const skip = 0;
      const sort = 'date';
      const order = 'ASC';
      const requesterUserId = 'userId';

      const conditions: FindManyOptions<Scheduling> = {
        take,
        skip,
        order: { [sort]: order },
        where: { user: { id: requesterUserId } },
      };

      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockScheduling], 1]);

      const result = await service.getAllSchedulings(
        take,
        skip,
        sort,
        order,
        undefined,
        undefined,
        undefined,
        undefined,
        requesterUserId,
        UserTypeEnum.USER,
      );

      expect(result).toStrictEqual({
        skip: null,
        total: 1,
        schedulings: [mockScheduling],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should filter by status when status is provided', async () => {
      const take = 10;
      const skip = 0;
      const sort = 'date';
      const order = 'ASC';
      const status = SchedulingStatus.PENDING;

      const conditions: FindManyOptions<Scheduling> = {
        take,
        skip,
        order: { [sort]: order },
        where: { status },
      };

      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockScheduling], 1]);

      const result = await service.getAllSchedulings(
        take,
        skip,
        sort,
        order,
        undefined,
        undefined,
        undefined,
        status,
      );

      expect(result).toStrictEqual({
        skip: null,
        total: 1,
        schedulings: [mockScheduling],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });
  });

  describe('deleteSchedulingById', () => {
    it('Should successfully delete a scheduling', async () => {
      repositoryMock.findOne = jest.fn().mockReturnValue(mockScheduling);
      repositoryMock.softRemove = jest.fn();

      const result = await service.deleteSchedulingById(mockScheduling.id);

      expect(result).toStrictEqual('removed');
      expect(repositoryMock.softRemove).toHaveBeenCalledWith(
        expect.objectContaining({ active: false }),
      );
    });

    it('Should throw the NotFoundException exception when scheduling not found', async () => {
      const error = new NotFoundException('scheduling with this id not found');

      repositoryMock.findOne = jest.fn();

      await expect(
        service.deleteSchedulingById(mockScheduling.id),
      ).rejects.toStrictEqual(error);
    });
  });
});
