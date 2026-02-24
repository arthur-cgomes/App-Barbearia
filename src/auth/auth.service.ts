import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, JwtResponse } from './interfaces/jwt-payload.interface';
import { AuthPayload } from './interfaces/auth.interface';
import { UserService } from '../user/user.service';
import { AuditService } from '../common/audit/audit.service';
import { User } from '../user/entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async validateUserByPassword(
    loginAttempt: AuthPayload,
  ): Promise<JwtResponse> {
    const userToAttempt = await this.userService.checkUserToLogin(
      loginAttempt.email,
    );

    return new Promise((resolve, reject) => {
      if (userToAttempt.checkPassword(loginAttempt.password)) {
        this.auditService.log('LOGIN_SUCCESS', userToAttempt.id, {
          email: loginAttempt.email,
        });
        resolve(this.createJwtPayload(userToAttempt));
      } else {
        this.auditService.log('LOGIN_FAILED', 'anonymous', {
          email: loginAttempt.email,
        });
        reject(new ForbiddenException('Senha inválida'));
      }
    });
  }

  async createJwtPayload(user: User): Promise<JwtResponse> {
    const data: JwtPayload = {
      email: user.email,
      userId: user.id,
      userType: user.userType,
    };
    const jwt = this.jwtService.sign(data);
    return {
      expiresIn: parseInt(process.env.EXPIRE_IN) || 7200,
      token: jwt,
      userId: user.id,
    };
  }

  async validateUserByJwt(payload: JwtPayload) {
    const user = await this.userService.checkUserToLogin(payload.email);
    if (user) {
      return this.createJwtPayload(user);
    } else {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async getMe(userId: string): Promise<User> {
    return await this.userService.getUserById(userId);
  }
}
