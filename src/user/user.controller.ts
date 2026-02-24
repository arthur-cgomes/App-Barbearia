import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Get,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DeleteResponseDto } from '../common/dto/delete-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUsersResponseDto } from './dto/get-all-user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um novo usuário',
  })
  @ApiCreatedResponse({ type: UserDto })
  @ApiConflictResponse({
    description: 'Usuário já cadastrado',
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Put('/:userId')
  @ApiOperation({
    summary: 'Atualiza um usuário',
  })
  @ApiOkResponse({ type: UserDto })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos',
  })
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(userId, updateUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/:userId')
  @ApiOperation({
    summary: 'Retorna um usuário pelo id',
  })
  @ApiOkResponse({ type: UserDto })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  async getUserById(@Param('userId') userId: string) {
    return await this.userService.getUserById(userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get()
  @ApiOperation({
    summary: 'Retorna todos usuários',
  })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiOkResponse({ type: GetAllUsersResponseDto })
  async getAllUsers(
    @Query('take') take = 10,
    @Query('skip') skip = 0,
    @Query('sort') sort = 'name',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
    @Query('search') search: string,
  ) {
    return await this.userService.getAllUsers(take, skip, sort, order, search);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Delete('/:userId')
  @ApiOperation({
    summary: 'Exclui um usuário',
  })
  @ApiOkResponse({ type: DeleteResponseDto })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  async deleteUserById(@Param('userId') userId: string) {
    return { message: await this.userService.deleteUserById(userId) };
  }
}
