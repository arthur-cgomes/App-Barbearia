import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.AUTH_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.userId) {
      throw new UnauthorizedException();
    }

    return {
      userId: payload.userId,
      email: payload.email,
      userType: payload.userType,
    };
  }
}
