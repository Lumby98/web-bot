import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthenticationService } from '../service/authentication.service';
import { User } from '../../infrastructure/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authenticationService: AuthenticationService) {
    super({
      usernameField: 'username',
    });
  }
  async validate(username: string, password: string): Promise<User> {
    return this.authenticationService.getAuthenticatedUser(username, password);
  }
}
