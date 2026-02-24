import {
  Controller,
  Post,
  Body,
  Patch,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AuthPayload } from './interfaces/auth.interface';
import { UserService } from '../user/user.service';
import { ResetPasswordDto } from '../user/dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({
    summary: 'Autentica o usuário',
    description: 'Retorna o token JWT para acesso aos endpoints protegidos.',
  })
  @ApiOkResponse({ description: 'Token JWT retornado' })
  @ApiUnauthorizedResponse({
    description: 'Senha inválida',
  })
  @ApiForbiddenResponse({
    description: 'Token inválido',
  })
  @Post()
  async login(@Body() auth: AuthPayload) {
    return await this.authService.validateUserByPassword(auth);
  }

  @SkipThrottle()
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna o perfil do usuário autenticado',
    description: 'Usa o userId extraído do token JWT.',
  })
  @ApiOkResponse({ description: 'Perfil do usuário retornado' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  @Get('/me')
  async getMe(@Req() req: any) {
    return await this.authService.getMe(req.user.userId);
  }

  @SkipThrottle()
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Recuperação de senha do usuário',
    description:
      'Permite que o usuário recupere sua senha usando a data de nascimento e o documento.',
  })
  @ApiOkResponse({ description: 'Senha alterada com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Token inválido ou ausente' })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  @Patch('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { birthdate, document, newPassword } = resetPasswordDto;
    await this.userService.resetPassword(birthdate, document, newPassword);
    return { message: 'Senha alterada com sucesso!' };
  }
}
