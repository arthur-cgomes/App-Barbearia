import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { FindManyOptions, ILike, In, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUsersResponseDto } from './dto/get-all-user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '../common/audit/audit.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly auditService: AuditService,
  ) {}

  async checkUserToLogin(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'userType'],
    });

    if (!user) throw new NotFoundException('user with this email not found');

    return user;
  }

  async resetPassword(
    birthdate: Date,
    document: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { birthdate, document },
    });

    if (!user) {
      throw new NotFoundException(
        'Usuário não encontrado com os dados fornecidos.',
      );
    }

    user.password = newPassword;
    await this.userRepository.save(user);
    this.auditService.log('PASSWORD_RESET', user.id, {
      document: user.document,
    });
  }

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    const checkUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { document: createUserDto.document },
      ],
    });

    if (checkUser) {
      throw new ConflictException('user already exists');
    }

    const user = await this.userRepository.create(createUserDto).save();
    this.auditService.log('USER_CREATED', user.id, { email: user.email });
    return user;
  }

  public async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    await this.getUserById(userId);

    const preloaded = await this.userRepository.preload({
      id: userId,
      ...updateUserDto,
    });

    if (!preloaded) {
      throw new NotFoundException('user with this id not found');
    }

    return await preloaded.save();
  }

  public async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('user with this id not found');
    }

    return user;
  }

  public async getUserByIds(ids: string[]): Promise<User[]> {
    return await this.userRepository.findBy({ id: In(ids) });
  }

  public async getAllUsers(
    take: number,
    skip: number,
    sort: string,
    order: 'ASC' | 'DESC',
    search?: string,
  ): Promise<GetAllUsersResponseDto> {
    const conditions: FindManyOptions<User> = {
      take,
      skip,
      order: {
        [sort]: order,
      },
    };

    if (search) {
      conditions.where = {
        name: ILike(`%${search}%`),
      };
    }

    const [users, count] = await this.userRepository.findAndCount(conditions);

    if (users.length === 0) {
      return { skip: null, total: 0, users };
    }
    const over = count - Number(take) - Number(skip);
    skip = over <= 0 ? null : Number(skip) + Number(take);

    return { skip, total: count, users };
  }

  public async deleteUserById(userId: string): Promise<string> {
    const user = await this.getUserById(userId);
    user.active = false;
    await this.userRepository.softRemove(user);
    this.auditService.log('USER_DELETED', userId, { email: user.email });

    return 'removed';
  }
}
