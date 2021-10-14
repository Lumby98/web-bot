import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthenticationService } from '../service/authentication.service';
import { UserDto } from '../../api/dto/user/user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authenticationService: AuthenticationService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<UserDto> {
    return this.authenticationService
      .getAuthenticatedUser(username, password)
      .catch(() => {
        throw new HttpException('wrong credentials', HttpStatus.BAD_REQUEST);
      });
  }
}
