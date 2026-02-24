import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  MockRepository,
  repositoryMockFactory,
} from '../../common/mock/test.util';
import { FindManyOptions, ILike, Repository } from 'typeorm';
import { BarberShopService } from '../barber-shop.service';
import { CreateBarberShopDto } from '../dto/create-barbershop.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateBarberShopDto } from '../dto/update-barbershop.dto';
import { BarberShop } from '../entity/barber-shop.entity';
import { mockBarberShop } from './mocks/barbershop.mock';
import { AuditService } from '../../common/audit/audit.service';
import { mockBarber } from '../../barber/__tests__/mocks/barber.mock';

describe('BarberShopService', () => {
  let service: BarberShopService;
  let repositoryMock: MockRepository<Repository<BarberShop>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BarberShopService,
        {
          provide: getRepositoryToken(BarberShop),
          useValue: repositoryMockFactory<BarberShop>(),
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<BarberShopService>(BarberShopService);
    repositoryMock = module.get(getRepositoryToken(BarberShop));
  });

  beforeEach(() => jest.clearAllMocks());

  describe('createbarbershop', () => {
    const createBarbershopDto: CreateBarberShopDto = {
      name: 'Teste',
      document: '62780460000137',
      address: 'adress',
      lat: -19.9191,
      long: -43.9386,
      cellphone: 'phone',
      email: 'email',
    };

    it('Should successfully create a barbershop', async () => {
      repositoryMock.findOne = jest.fn();
      repositoryMock.create = jest
        .fn()
        .mockReturnValue({ save: () => mockBarberShop });
      const result = await service.createBarberShop(createBarbershopDto);

      expect(result).toStrictEqual(mockBarberShop);
      expect(repositoryMock.create).toHaveBeenCalledWith({
        ...createBarbershopDto,
      });
    });

    it('Should throw a ConflictException if barbershop already exists', async () => {
      const error = new ConflictException(
        'barbershop already exists with this CNPJ',
      );
      repositoryMock.findOne = jest.fn().mockReturnValue(mockBarberShop);

      await expect(
        service.createBarberShop(createBarbershopDto),
      ).rejects.toStrictEqual(error);
      expect(repositoryMock.create).not.toHaveBeenCalled();
    });
  });

  describe('updateBarberShop', () => {
    const updateBarberShopDto: UpdateBarberShopDto = {
      name: 'Teste',
      document: '62780460000137',
      address: 'adress',
      lat: -19.9191,
      long: -43.9386,
      cellphone: 'phone',
      email: 'email',
    };

    it('Should successfully update a barbershop', async () => {
      repositoryMock.findOne = jest.fn().mockReturnValue(mockBarberShop);
      repositoryMock.preload = jest
        .fn()
        .mockReturnValue({ save: () => mockBarberShop });

      const result = await service.updateBarberShop(
        mockBarberShop.id,
        updateBarberShopDto,
      );

      expect(result).toStrictEqual(mockBarberShop);
      expect(repositoryMock.preload).toHaveBeenCalledWith({
        id: mockBarberShop.id,
        ...updateBarberShopDto,
      });
    });

    it('Should throw a NotFoundException if barbershop does not exist', async () => {
      const error = new NotFoundException('barbershop with this id not found');

      repositoryMock.findOne = jest.fn();

      await expect(
        service.updateBarberShop(mockBarberShop.id, updateBarberShopDto),
      ).rejects.toStrictEqual(error);
      expect(repositoryMock.preload).not.toHaveBeenCalled();
    });

    it('Should throw NotFoundException when preload returns null', async () => {
      const error = new NotFoundException('barbershop with this id not found');

      repositoryMock.findOne = jest.fn().mockReturnValue(mockBarberShop);
      repositoryMock.preload = jest.fn().mockReturnValue(null);

      await expect(
        service.updateBarberShop(mockBarberShop.id, updateBarberShopDto),
      ).rejects.toStrictEqual(error);
    });
  });

  describe('getBarberShopById', () => {
    it('Should successfully get a barbershop by id', async () => {
      repositoryMock.findOne = jest.fn().mockReturnValue(mockBarberShop);

      const result = await service.getBarberShopById(mockBarberShop.id);

      expect(result).toStrictEqual(mockBarberShop);
    });

    it('Should throw a NotFoundException if barbershop does not exist', async () => {
      const error = new NotFoundException('barbershop with this id not found');

      repositoryMock.findOne = jest.fn();

      await expect(
        service.getBarberShopById(mockBarberShop.id),
      ).rejects.toStrictEqual(error);
    });
  });

  describe('getBarberShopByIds', () => {
    it('Should successfully get barbershop by ids', async () => {
      repositoryMock.findBy = jest.fn().mockReturnValue([mockBarberShop]);

      const result = await service.getBarberShopByIds([mockBarberShop.id]);

      expect(result).toStrictEqual([mockBarberShop]);
    });
  });

  describe('getAllBarberShops', () => {
    it('Should successfully get all barbershops', async () => {
      const take = 1;
      const skip = 0;
      const document = '';
      const search = '';

      const conditions: FindManyOptions<BarberShop> = {
        take,
        skip,
        order: expect.any(Object),
        where: {},
      };

      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockBarberShop], 10]);

      const result = await service.getAllBarberShops(
        take,
        skip,
        '',
        'ASC',
        document,
        search,
      );

      expect(result).toStrictEqual({
        skip: 1,
        total: 10,
        barbershops: [mockBarberShop],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should successfully get all barbershops with search', async () => {
      const search = 'search';
      const take = 1;
      const skip = 0;
      const document = '';

      const conditions: FindManyOptions<BarberShop> = {
        take,
        skip,
        order: expect.any(Object),
        where: { name: ILike('%' + search + '%') },
      };

      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockBarberShop], 10]);

      const result = await service.getAllBarberShops(
        take,
        skip,
        '',
        'ASC',
        document,
        search,
      );

      const expectedSkip = 1;
      expect(result).toStrictEqual({
        skip: expectedSkip,
        total: 10,
        barbershops: [mockBarberShop],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should successfully get all barbershops filtered by document', async () => {
      const take = 1;
      const skip = 0;
      const document = '123.456.789-00';
      const search = '';

      const conditions: FindManyOptions<BarberShop> = {
        take,
        skip,
        order: expect.any(Object),
        where: { document },
      };

      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockBarberShop], 10]);

      const result = await service.getAllBarberShops(
        take,
        skip,
        '',
        'ASC',
        document,
        search,
      );

      const expectedSkip = 1;

      expect(result).toStrictEqual({
        skip: expectedSkip,
        total: 10,
        barbershops: [mockBarberShop],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should successfully return an empty list of barbershops', async () => {
      const take = 1;
      const skip = 0;
      const document = '';
      const search = '';

      const conditions: FindManyOptions<BarberShop> = {
        take,
        skip,
        order: expect.any(Object),
        where: {},
      };

      repositoryMock.findAndCount = jest.fn().mockReturnValue([[], 0]);

      const result = await service.getAllBarberShops(
        take,
        skip,
        '',
        'ASC',
        document,
        search,
      );

      expect(result).toStrictEqual({ skip: null, total: 0, barbershops: [] });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should return skip as null when there are no more barbershops to paginate', async () => {
      const take = 5;
      const skip = 0;
      const search = 'search';
      const document = '';

      const count = 5;
      const conditions: FindManyOptions<BarberShop> = {
        take,
        skip,
        order: expect.any(Object),
        where: { name: ILike('%' + search + '%') },
      };

      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockBarberShop], count]);

      const result = await service.getAllBarberShops(
        take,
        skip,
        '',
        'ASC',
        document,
        search,
      );

      expect(result).toStrictEqual({
        skip: null,
        total: count,
        barbershops: [mockBarberShop],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should calculate skip correctly when there are more barbershops to paginate', async () => {
      const take = 5;
      const skip = 0;
      const search = 'search';
      const document = '';

      const count = 15;
      const conditions: FindManyOptions<BarberShop> = {
        take,
        skip,
        order: expect.any(Object),
        where: { name: ILike('%' + search + '%') },
      };

      repositoryMock.findAndCount = jest
        .fn()
        .mockReturnValue([[mockBarberShop], count]);

      const result = await service.getAllBarberShops(
        take,
        skip,
        '',
        'ASC',
        document,
        search,
      );

      const expectedSkip = 5;
      expect(result).toStrictEqual({
        skip: expectedSkip,
        total: count,
        barbershops: [mockBarberShop],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });
  });

  describe('deleteBarberShopById', () => {
    it('Should successfully delete a barbershop', async () => {
      repositoryMock.findOne = jest.fn().mockReturnValue(mockBarberShop);
      repositoryMock.softRemove = jest.fn();

      const result = await service.deleteBarberShopById(mockBarberShop.id);

      expect(result).toStrictEqual('removed');
      expect(repositoryMock.softRemove).toHaveBeenCalledWith(
        expect.objectContaining({ active: false }),
      );
    });

    it('Should throw a NotFoundException if barbershop does not exist', async () => {
      const error = new NotFoundException('barbershop with this id not found');

      repositoryMock.findOne = jest.fn();

      await expect(
        service.deleteBarberShopById(mockBarberShop.id),
      ).rejects.toStrictEqual(error);
    });
  });

  describe('addBarberToShop', () => {
    it('Should successfully add a barber to a barbershop', async () => {
      const barbershopWithBarbers = { ...mockBarberShop, barber: [] };
      repositoryMock.findOne = jest.fn().mockReturnValue(barbershopWithBarbers);
      repositoryMock.save = jest
        .fn()
        .mockReturnValue({ ...barbershopWithBarbers, barber: [mockBarber] });

      const result = await service.addBarberToShop(
        mockBarberShop.id,
        mockBarber,
      );

      expect(result.barber).toContain(mockBarber);
      expect(repositoryMock.save).toHaveBeenCalled();
    });

    it('Should initialize barber array when it is null and add barber', async () => {
      const barbershopWithNullBarbers = { ...mockBarberShop, barber: null };
      repositoryMock.findOne = jest
        .fn()
        .mockReturnValue(barbershopWithNullBarbers);
      repositoryMock.save = jest
        .fn()
        .mockReturnValue({ ...mockBarberShop, barber: [mockBarber] });

      const result = await service.addBarberToShop(
        mockBarberShop.id,
        mockBarber,
      );

      expect(repositoryMock.save).toHaveBeenCalled();
      expect(result.barber).toContain(mockBarber);
    });

    it('Should not add barber if already associated', async () => {
      const barbershopWithBarbers = {
        ...mockBarberShop,
        barber: [mockBarber],
      };
      repositoryMock.findOne = jest.fn().mockReturnValue(barbershopWithBarbers);
      repositoryMock.save = jest.fn().mockReturnValue(barbershopWithBarbers);

      await service.addBarberToShop(mockBarberShop.id, mockBarber);

      expect(repositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ barber: [mockBarber] }),
      );
    });

    it('Should throw NotFoundException when barbershop not found', async () => {
      const error = new NotFoundException('barbershop with this id not found');
      repositoryMock.findOne = jest.fn().mockReturnValue(null);

      await expect(
        service.addBarberToShop(mockBarberShop.id, mockBarber),
      ).rejects.toStrictEqual(error);
    });
  });

  describe('removeBarberFromShop', () => {
    it('Should successfully remove a barber from a barbershop', async () => {
      const barbershopWithBarbers = {
        ...mockBarberShop,
        barber: [mockBarber],
      };
      repositoryMock.findOne = jest.fn().mockReturnValue(barbershopWithBarbers);
      repositoryMock.save = jest
        .fn()
        .mockReturnValue({ ...barbershopWithBarbers, barber: [] });

      const result = await service.removeBarberFromShop(
        mockBarberShop.id,
        mockBarber.id,
      );

      expect(result.barber).toEqual([]);
      expect(repositoryMock.save).toHaveBeenCalled();
    });

    it('Should handle null barber array gracefully when removing', async () => {
      const barbershopWithNullBarbers = { ...mockBarberShop, barber: null };
      repositoryMock.findOne = jest
        .fn()
        .mockReturnValue(barbershopWithNullBarbers);
      repositoryMock.save = jest
        .fn()
        .mockReturnValue({ ...mockBarberShop, barber: [] });

      const result = await service.removeBarberFromShop(
        mockBarberShop.id,
        mockBarber.id,
      );

      expect(result.barber).toEqual([]);
      expect(repositoryMock.save).toHaveBeenCalled();
    });

    it('Should throw NotFoundException when barbershop not found', async () => {
      const error = new NotFoundException('barbershop with this id not found');
      repositoryMock.findOne = jest.fn().mockReturnValue(null);

      await expect(
        service.removeBarberFromShop(mockBarberShop.id, mockBarber.id),
      ).rejects.toStrictEqual(error);
    });
  });
});
