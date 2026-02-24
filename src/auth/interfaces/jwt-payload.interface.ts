import { UserTypeEnum } from '../../common/enum/user-type.enum';

export interface JwtPayload {
  userId: string;
  email: string;
  userType: UserTypeEnum;
}

export interface JwtResponse {
  expiresIn: number;
  token: string;
  userId: string;
}
