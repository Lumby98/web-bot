import { UserService } from './user.service';
import { RegisterDto } from '../../api/dto/authentication/register.dto';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../../api/dto/user/create-user.dto';
import { UserDto } from '../../api/dto/user/user.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async register(registrationData: RegisterDto): Promise<UserDto> {
    try {
      const hashedPassword = await bcrypt.hash(registrationData.password, 10);
      const userDto: CreateUserDto = {
        username: registrationData.username,
        password: hashedPassword,
        admin: registrationData.admin,
      };
      const createdUser = await this.userService.create(userDto);
      return JSON.parse(JSON.stringify(createdUser));
    } catch (err) {
      throw err;
    }
  }

  public async getAuthenticatedUser(
    username: string,
    plainTextPassword: string,
  ): Promise<UserDto> {
    try {
      const user = await this.userService.getByUsername(username);
      await this.verifyPassword(plainTextPassword, user.password);
      return JSON.parse(JSON.stringify(user));
    } catch (err) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );

    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public getCookieWithJwtToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_EXPIRATION_TIME',
    )};`;
  }

  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }
}
