import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/user/dto/login-user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(userLoginDto: LoginUserDto): Promise<any> {
    const user = await this.authService.validateUser(userLoginDto);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
