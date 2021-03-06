import { RegisterDto } from '../../../../ui.api/dto/authentication/register.dto';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../../../../ui.api/dto/user/create-user.dto';
import { UserDto } from '../../../../ui.api/dto/user/user.dto';
import { AuthenticationInterface } from '../../interfaces/auth/authentication.interface';
import {
  UserInterface,
  userInterfaceProvider,
} from '../../interfaces/auth/user.interface';

@Injectable()
export class AuthenticationService implements AuthenticationInterface {
  constructor(
    @Inject(userInterfaceProvider) private readonly userService: UserInterface,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * creates a new user, hashes their password and saves it to the database
   * @param registrationData
   */
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

  /**
   * check if user password matches the hashed password saved in the database
   * returns the user if the passwords match
   * @param username
   * @param plainTextPassword
   */
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

  /**
   * compares two passwords and returns a boolean depending on the result
   * @param plainTextPassword
   * @param hashedPassword
   */
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

  /**
   * creates a new jwt token
   * @param userId
   */
  public getCookieWithJwtToken(userId: number) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_EXPIRATION_TIME',
    )};`;
    // SameSite=None; secure
  }

  /**
   * sets the jwt token to expire, so the logEntry out action can be executed
   */
  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0;`;
    //SameSite=None; secure
  }
}
