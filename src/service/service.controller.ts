import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import { DeleteResponseDto } from 'src/common/dto/delete-response.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { GetAllServicesResponseDto } from './dto/get-all-service.dto';
import { ServicesDto } from './dto/service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './service.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserTypeEnum } from '../common/enum/user-type.enum';

@ApiTags('Service')
@Controller('service')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(UserTypeEnum.ADMIN)
  @Post()
  @ApiOperation({
    summary: 'Cria um serviço',
  })
  @ApiCreatedResponse({ type: ServicesDto })
  @ApiConflictResponse({
    description: 'Serviço com esse nome já existe',
  })
  async createServices(@Body() createServiceDto: CreateServiceDto) {
    return await this.servicesService.createService(createServiceDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(UserTypeEnum.ADMIN)
  @Put('/:serviceId')
  @ApiOperation({
    summary: 'Atualiza um serviço',
  })
  @ApiOkResponse({ type: ServicesDto })
  @ApiNotFoundResponse({ description: 'Serviço não encontrado' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos',
  })
  async updateService(
    @Param('serviceId') serviceId: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return await this.servicesService.updateService(
      serviceId,
      updateServiceDto,
    );
  }

  @Get('/:serviceId')
  @ApiOperation({
    summary: 'Retorna um serviço pelo id',
  })
  @ApiOkResponse({ type: ServicesDto })
  @ApiNotFoundResponse({ description: 'Serviço não encontrado' })
  async getServiceById(@Param('serviceId') serviceId: string) {
    return await this.servicesService.getServiceById(serviceId);
  }

  @Get()
  @ApiOperation({
    summary: 'Retorna todos os serviços',
  })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'barberShopId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiOkResponse({ type: GetAllServicesResponseDto })
  async getAllServices(
    @Query('take') take = 10,
    @Query('skip') skip = 0,
    @Query('sort') sort = 'name',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
    @Query('barberShopId') barberShopId?: string,
    @Query('search') search?: string,
  ) {
    return await this.servicesService.getAllServices(
      take,
      skip,
      sort,
      order,
      barberShopId,
      search,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(UserTypeEnum.ADMIN)
  @Delete('/:serviceId')
  @ApiOperation({
    summary: 'Exclui um serviço',
  })
  @ApiOkResponse({ type: DeleteResponseDto })
  @ApiNotFoundResponse({ description: 'Serviço não encontrado' })
  async deleteServiceById(@Param('serviceId') serviceId: string) {
    return { message: await this.servicesService.deleteServiceById(serviceId) };
  }
}
