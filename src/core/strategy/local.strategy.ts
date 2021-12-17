import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserDto } from '../../ui.api/dto/user/user.dto';
import {
  AuthenticationInterface,
  authenticationInterfaceProvider,
} from '../application.services/interfaces/auth/authentication.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(authenticationInterfaceProvider)
    private authenticationService: AuthenticationInterface,
  ) {
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
