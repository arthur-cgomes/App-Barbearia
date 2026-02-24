import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  MockRepository,
  repositoryMockFactory,
} from '../../common/mock/test.util';
import { FindManyOptions, ILike, Repository } from 'typeorm';
import { BarberService } from '../barber.service';
import { CreateBarberDto } from '../dto/create-barber.dto';
import { Barber } from '../entity/barber.entity';
import { UpdateBarberDto } from '../dto/update-barber.dto';
import { mockBarber } from './mocks/barber.mock';
import { AuditService } from '../../common/audit/audit.service';

describe('BarberService', () => {
  let service: BarberService;
  let repositoryMock: MockRepository<Repository<Barber>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BarberService,
        {
          provide: getRepositoryToken(Barber),
          useValue: repositoryMockFactory(),
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<BarberService>(BarberService);

    repositoryMock = module.get(getRepositoryToken(Barber));
  });

  beforeEach(() => jest.clearAllMocks());

  describe('createBarber', () => {
    const createBarberDto: CreateBarberDto = {
      document: 'document',
      name: 'Arthur Gomes',
      email: 'email@agtecnologia.com.br',
      cellphone: '(31)98517-1031',
      barbershopId: 'barbershopId',
    };

    it('Should successfully create a barber', async () => {
      repositoryMock.findOne = jest.fn();
      repositoryMock.create = jest
        .fn()
        .mockReturnValue({ save: () => mockBarber });

      const result = await service.createBarber(createBarberDto);

      expect(result).toStrictEqual(mockBarber);
      expect(repositoryMock.create).toHaveBeenCalledWith({
        ...createBarberDto,
      });
    });

    it('Should throw a ConflictException if barber already exists', async () => {
      const error = new ConflictException('barber already exists');

      repositoryMock.findOne = jest.fn().mockReturnValue(createBarberDto);

      await expect(service.createBarber(createBarberDto)).rejects.toStrictEqual(
        error,
      );
      expect(repositoryMock.create).not.toHaveBeenCalled();
    });
  });

  describe('updateBarber', () => {
    const updateBarberDto: UpdateBarberDto = {
      document: 'document',
      name: 'Arthur Gomes',
      email: 'email@agtecnologia.com.br',
      cellphone: '(31)98517-1031',
      barbershopId: 'barbershopId',
    };

    it('Should successfully update a barber', async () => {
      repositoryMock.findOne = jest.fn().mockReturnValue(mockBarber);
      repositoryMock.preload = jest
        .fn()
        .mockReturnValue({ save: () => mockBarber });

      const result = await service.updateBarber(mockBarber.id, updateBarberDto);

      expect(result).toStrictEqual(mockBarber);
      expect(repositoryMock.preload).toHaveBeenCalledWith({
        id: mockBarber.id,
        ...updateBarberDto,
      });
    });
    it('Should throw a NotFoundException if barber does not exist', async () => {
      const error = new NotFoundException('barber id not found');

      repositoryMock.findOne = jest.fn();

      await expect(
        service.updateBarber(mockBarber.id, updateBarberDto),
      ).rejects.toStrictEqual(error);
      expect(repositoryMock.preload).not.toHaveBeenCalled();
    });

    it('Should throw NotFoundException when preload returns null', async () => {
      const error = new NotFoundException('barber id not found');

      repositoryMock.findOne = jest.fn().mockReturnValue(mockBarber);
      repositoryMock.preload = jest.fn().mockReturnValue(null);

      await expect(
        service.updateBarber(mockBarber.id, updateBarberDto),
      ).rejects.toStrictEqual(error);
    });
  });

  describe('getBarberById', () => {
    it('Should successfully get a barber by id', async () => {
      repositoryMock.findOne = jest.fn().mockReturnValue(mockBarber);

      const result = await service.getBarberById(mockBarber.id);

      expect(result).toStrictEqual(mockBarber);
    });

    it('Should throw a NotFoundException if barber does not exist', async () => {
      const error = new NotFoundException('barber id not found');

      repositoryMock.findOne = jest.fn();

      await expect(service.getBarberById(mockBarber.id)).rejects.toStrictEqual(
        error,
      );
    });
  });

  describe('getAllBarbers', () => {
    it('Should successfully get all barbers', async () => {
      const take = 1;
      const skip = 0;
      const sort = 'name';
      const order = 'ASC';
      const barbershopId = '';
      const search = '';

      const conditions: FindManyOptions<Barber> = {
        take,
        skip,
        order: { [sort]: order },
        where: {},
      };
      repositoryMock.findAndCount.mockResolvedValue([[mockBarber], 10]);

      const result = await service.getAllBarbers(
        take,
        skip,
        sort,
        order,
        barbershopId,
        search,
      );

      expect(result).toStrictEqual({
        skip: 1,
        total: 10,
        barbers: [mockBarber],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should successfully get all barbers with barbershopId', async () => {
      const barbershopId = 'barbershopId';
      const take = 10;
      const skip = 0;
      const sort = 'name';
      const order = 'ASC';
      const search = '';

      const conditions: FindManyOptions<Barber> = {
        take,
        skip,
        order: { [sort]: order },
        where: { barbershop: { id: barbershopId } },
      };

      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockBarber], 10]);

      const result = await service.getAllBarbers(
        take,
        skip,
        sort,
        order,
        barbershopId,
        search,
      );

      expect(result).toStrictEqual({
        skip: null,
        total: 10,
        barbers: [mockBarber],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should successfully get all barbers with search', async () => {
      const search = 'search';
      const take = 10;
      const skip = 0;
      const sort = 'name';
      const order = 'ASC';
      const barbershopId = '';

      const conditions: FindManyOptions<Barber> = {
        take,
        skip,
        order: { [sort]: order },
        where: { name: ILike('%' + search + '%') },
      };

      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockBarber], 10]);

      const result = await service.getAllBarbers(
        take,
        skip,
        sort,
        order,
        barbershopId,
        search,
      );

      expect(result).toStrictEqual({
        skip: null,
        total: 10,
        barbers: [mockBarber],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should successfully return an empty list of barbers', async () => {
      const take = 10;
      const skip = 10;
      const sort = 'name';
      const order = 'ASC';
      const barbershopId = '';
      const search = '';

      const conditions: FindManyOptions<Barber> = {
        take,
        skip,
        order: { [sort]: order },
        where: {},
      };

      repositoryMock.findAndCount = jest.fn().mockReturnValue([[], 0]);

      const result = await service.getAllBarbers(
        take,
        skip,
        sort,
        order,
        barbershopId,
        search,
      );

      expect(result).toStrictEqual({ skip: null, total: 0, barbers: [] });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should increment skip when more results are available', async () => {
      const take = 5;
      const skip = 0;
      const sort = 'name';
      const order = 'ASC';
      const barbershopId = '';
      const search = '';

      const conditions: FindManyOptions<Barber> = {
        take,
        skip,
        order: { [sort]: order },
        where: {},
      };

      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockBarber], 15]);

      const result = await service.getAllBarbers(
        take,
        skip,
        sort,
        order,
        barbershopId,
        search,
      );

      expect(result).toStrictEqual({
        skip: 5,
        total: 15,
        barbers: [mockBarber],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should set skip to null when no more results are available', async () => {
      const take = 5;
      const skip = 5;
      const sort = 'name';
      const order = 'ASC';
      const barbershopId = '';
      const search = '';

      const conditions: FindManyOptions<Barber> = {
        take,
        skip,
        order: { [sort]: order },
        where: {},
      };

      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockBarber], 5]);

      const result = await service.getAllBarbers(
        take,
        skip,
        sort,
        order,
        barbershopId,
        search,
      );

      expect(result).toStrictEqual({
        skip: null,
        total: 5,
        barbers: [mockBarber],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });
  });

  describe('deleteBarberById', () => {
    it('Should successfully delete a barber', async () => {
      repositoryMock.findOne = jest.fn().mockReturnValue(mockBarber);
      repositoryMock.softRemove = jest.fn();

      const result = await service.deleteBarberById(mockBarber.id);

      expect(result).toStrictEqual('removed');
      expect(repositoryMock.softRemove).toHaveBeenCalledWith(
        expect.objectContaining({ active: false }),
      );
    });

    it('Should throw a NotFoundException if barber does not exist', async () => {
      const error = new NotFoundException('barber id not found');

      repositoryMock.findOne = jest.fn();

      await expect(
        service.deleteBarberById(mockBarber.id),
      ).rejects.toStrictEqual(error);
    });
  });
});
