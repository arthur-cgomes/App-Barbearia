import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Put,
  Get,
  Query,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
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
import { BarberService } from './barber.service';
import { BarberDto } from './dto/barber.dto';
import { CreateBarberDto } from './dto/create-barber.dto';
import { GetAllBarbersResponseDto } from './dto/get-all-barber-response.dto';
import { UpdateBarberDto } from './dto/update-barber.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserTypeEnum } from '../common/enum/user-type.enum';

@ApiTags('Barber')
@Controller('barber')
export class BarberController {
  constructor(private readonly barberService: BarberService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(UserTypeEnum.ADMIN)
  @Post()
  @ApiOperation({
    summary: 'Cria um novo barbeiro',
  })
  @ApiCreatedResponse({ type: BarberDto })
  @ApiConflictResponse({
    description: 'Barbeiro já cadastrado',
  })
  async createBarber(@Body() createBarberDto: CreateBarberDto) {
    return await this.barberService.createBarber(createBarberDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(UserTypeEnum.ADMIN)
  @Put('/:barberId')
  @ApiOperation({
    summary: 'Atualiza um barbeiro',
  })
  @ApiOkResponse({ type: BarberDto })
  @ApiNotFoundResponse({ description: 'Barbeiro não encontrado' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos',
  })
  async updateBarber(
    @Param('barberId') barberId: string,
    @Body() updateBarberDto: UpdateBarberDto,
  ) {
    return await this.barberService.updateBarber(barberId, updateBarberDto);
  }

  @Get('/:barberId')
  @ApiOperation({
    summary: 'Retorna um barbeiro pelo id',
  })
  @ApiOkResponse({ type: BarberDto })
  @ApiNotFoundResponse({ description: 'Barbeiro não encontrado' })
  async getBarberById(@Param('barberId') barberId: string) {
    return await this.barberService.getBarberById(barberId);
  }

  @Get()
  @ApiOperation({
    summary: 'Retorna todos os barbeiros',
  })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'barbershopId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiOkResponse({ type: GetAllBarbersResponseDto })
  async getAllBarbers(
    @Query('take') take = 10,
    @Query('skip') skip = 0,
    @Query('sort') sort = 'name',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
    @Query('barbershopId') barbershopId?: string,
    @Query('search') search?: string,
  ) {
    return await this.barberService.getAllBarbers(
      take,
      skip,
      sort,
      order,
      barbershopId,
      search,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(UserTypeEnum.ADMIN)
  @Delete('/:barberId')
  @ApiOperation({
    summary: 'Exclui um barbeiro',
  })
  @ApiOkResponse({ type: DeleteResponseDto })
  @ApiNotFoundResponse({ description: 'Barbeiro não encontrado' })
  async deleteBarberById(@Param('barberId') barberId: string) {
    return { message: await this.barberService.deleteBarberById(barberId) };
  }
}
