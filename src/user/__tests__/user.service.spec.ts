import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindManyOptions, ILike, Repository } from 'typeorm';
import {
  MockRepository,
  repositoryMockFactory,
} from '../../common/mock/test.util';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entity/user.entity';
import { UserService } from '../user.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';
import { mockUser } from './mocks/user.mock';
import { UserTypeEnum } from '../../common/enum/user-type.enum';
import { AuditService } from '../../common/audit/audit.service';

describe('UserService', () => {
  let service: UserService;
  let repositoryMock: MockRepository<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMockFactory<User>(),
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repositoryMock = module.get(getRepositoryToken(User));
  });

  describe('checkUserToLogin', () => {
    it('Should successfully return user for a valid email', async () => {
      const email = 'email@agtecnologia.com.br';
      repositoryMock.findOne = jest.fn().mockReturnValue(mockUser);

      const result = await service.checkUserToLogin(mockUser.email);

      expect(result).toStrictEqual(mockUser);
      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { email },
        select: ['id', 'email', 'password', 'userType'],
      });
    });

    it('Should throw NotFoundException when user with email does not exist', async () => {
      const email = 'nonexistent@agtecnologia.com.br';

      repositoryMock.findOne = jest.fn().mockReturnValue(null);

      await expect(service.checkUserToLogin(email)).rejects.toThrow(
        new NotFoundException('user with this email not found'),
      );
      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { email },
        select: ['id', 'email', 'password', 'userType'],
      });
    });
  });

  describe('resetPassword', () => {
    const birthdate = new Date('1990-01-01');
    const document = '000.000.000-00';
    const newPassword = 'newPassword123';

    it('Should successfully reset the password when birthdate and document match', async () => {
      repositoryMock.findOne = jest.fn().mockReturnValue(mockUser);
      repositoryMock.save = jest.fn().mockResolvedValue(mockUser);

      await service.resetPassword(birthdate, document, newPassword);

      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { birthdate, document },
      });
      expect(repositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ password: newPassword }),
      );
    });

    it('Should throw NotFoundException when user is not found', async () => {
      repositoryMock.findOne = jest.fn().mockReturnValue(null);

      await expect(
        service.resetPassword(birthdate, document, newPassword),
      ).rejects.toThrow(
        new NotFoundException(
          'Usuário não encontrado com os dados fornecidos.',
        ),
      );

      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { birthdate, document },
      });
      expect(repositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      name: 'Arthur Gomes',
      document: '000.000.000-00',
      birthdate: new Date(),
      cellphone: '(31)98517-1031',
      email: 'email@agtecnologia.com.br',
      password: 'password',
      userType: UserTypeEnum.ADMIN,
    };

    it('Should successfully create user', async () => {
      repositoryMock.findOne = jest.fn();
      repositoryMock.create = jest
        .fn()
        .mockReturnValue({ save: () => mockUser });

      const result = await service.createUser(createUserDto);

      expect(result).toStrictEqual(mockUser);
      expect(repositoryMock.create).toHaveBeenCalledWith({
        ...createUserDto,
      });
    });

    it('Should throw the ConflictException exception when user already exists', async () => {
      const error = new ConflictException('user already exists');

      repositoryMock.findOne = jest.fn().mockReturnValue(mockUser);

      await expect(service.createUser(createUserDto)).rejects.toStrictEqual(
        error,
      );
      expect(repositoryMock.create).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    const updateUserDto: UpdateUserDto = {
      email: 'email@agtecnologia.com.br',
      name: 'Arthur Gomes',
      birthdate: new Date(),
      cellphone: '(31)98517-1031',
    };

    it('Should successfully update a user', async () => {
      repositoryMock.findOne = jest.fn().mockReturnValue(mockUser);
      repositoryMock.preload = jest
        .fn()
        .mockReturnValue({ save: () => mockUser });

      const result = await service.updateUser(mockUser.id, updateUserDto);

      expect(result).toStrictEqual(mockUser);
      expect(repositoryMock.preload).toHaveBeenCalledWith({
        id: mockUser.id,
        ...updateUserDto,
      });
    });

    it('Should throw the NotFoundException exception when user not found', async () => {
      const error = new NotFoundException('user with this id not found');

      repositoryMock.findOne = jest.fn();

      await expect(
        service.updateUser(mockUser.id, updateUserDto),
      ).rejects.toStrictEqual(error);
      expect(repositoryMock.preload).not.toHaveBeenCalled();
    });

    it('Should throw NotFoundException when preload returns null', async () => {
      const error = new NotFoundException('user with this id not found');

      repositoryMock.findOne = jest.fn().mockReturnValue(mockUser);
      repositoryMock.preload = jest.fn().mockReturnValue(null);

      await expect(
        service.updateUser(mockUser.id, updateUserDto),
      ).rejects.toStrictEqual(error);
    });
  });

  describe('getUserById', () => {
    it('Should successfully get a user by id', async () => {
      repositoryMock.findOne = jest.fn().mockReturnValue(mockUser);

      const result = await service.getUserById(mockUser.id);

      expect(result).toStrictEqual(mockUser);
    });

    it('Should throw the NotFoundException exception when user id not found', async () => {
      const error = new NotFoundException('user with this id not found');

      repositoryMock.findOne = jest.fn();

      await expect(service.getUserById(mockUser.id)).rejects.toStrictEqual(
        error,
      );
    });
  });

  describe('getUserByIds', () => {
    it('Should successfully get users by ids', async () => {
      repositoryMock.findBy = jest.fn().mockReturnValue([mockUser]);

      const result = await service.getUserByIds([mockUser.id]);

      expect(result).toStrictEqual([mockUser]);
    });
  });

  describe('getAllUsers', () => {
    it('Should successfully get all users', async () => {
      const take = 1;
      const skip = 0;
      const search = '';
      const conditions: FindManyOptions<User> = {
        take,
        skip,
        order: expect.any(Object),
      };

      repositoryMock.findAndCount = jest.fn().mockReturnValue([[mockUser], 10]);

      const result = await service.getAllUsers(take, skip, '', 'ASC', search);

      expect(result).toStrictEqual({
        skip: 1,
        total: 10,
        users: [mockUser],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should successfully get all users with search', async () => {
      const search = 'search';
      const take = 10;
      const skip = 0;

      const conditions: FindManyOptions<User> = {
        take,
        skip,
        order: expect.any(Object),
        where: { name: ILike('%' + search + '%') },
      };

      repositoryMock.findAndCount = jest.fn().mockReturnValue([[mockUser], 10]);

      const result = await service.getAllUsers(take, skip, '', 'ASC', search);

      expect(result).toStrictEqual({
        skip: null,
        total: 10,
        users: [mockUser],
      });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });

    it('Should successfully return an empty list of users', async () => {
      const take = 1;
      const skip = 0;
      const search = '';
      const conditions: FindManyOptions<User> = {
        take,
        skip,
        order: expect.any(Object),
      };

      repositoryMock.findAndCount = jest.fn().mockReturnValue([[], 0]);

      const result = await service.getAllUsers(take, skip, '', 'ASC', search);

      expect(result).toStrictEqual({ skip: null, total: 0, users: [] });
      expect(repositoryMock.findAndCount).toHaveBeenCalledWith(conditions);
    });
  });

  describe('deleteUserById', () => {
    it('Should successfully delete a user by id', async () => {
      repositoryMock.findOne = jest.fn().mockReturnValue(mockUser);
      repositoryMock.softRemove = jest.fn();

      const result = await service.deleteUserById(mockUser.id);

      expect(result).toStrictEqual('removed');
      expect(repositoryMock.softRemove).toHaveBeenCalledWith(
        expect.objectContaining({ active: false }),
      );
    });

    it('Should throw the NotFoundException exception when user id not found', async () => {
      const error = new NotFoundException('user with this id not found');

      repositoryMock.findOne = jest.fn();

      await expect(service.deleteUserById(mockUser.id)).rejects.toStrictEqual(
        error,
      );
    });
  });
});
