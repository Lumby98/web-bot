import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RegisterDto } from '../dto/authentication/register.dto';
import { LocalAuthenticationGuard } from '../guard/localAuthentication.guard';
import { RequestWithUser } from '../../core/authentication/interface/requestWithUser.interface';
import { Response } from 'express';
import { jwtAuthenticationGuard } from '../guard/jwt-authentication.guard';
import { UserDto } from '../dto/user/user.dto';
import {
  AuthenticationInterface,
  authenticationInterfaceProvider,
} from '../../core/interfaces/authentication.interface';

/**
 * authentication is made with help from the following guide from wanago.io
 * https://wanago.io/2020/05/25/api-nestjs-authenticating-users-bcrypt-passport-jwt-cookies/
 */
@Controller('authentication')
export class AuthenticationController {
  constructor(
    @Inject(authenticationInterfaceProvider)
    private readonly authenticationService: AuthenticationInterface,
  ) {}

  /**
   * calls the authentication service to create a user,
   * if the request has an jwt token attached to it
   * @param registrationData
   */
  @UseGuards(jwtAuthenticationGuard)
  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    return this.authenticationService
      .register(registrationData)
      .catch((err) => {
        throw err;
      });
  }

  /**
   * logs a user in and gives them a jwt token
   * @param request
   * @param response
   */
  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('logEntry-in')
  async logIn(@Req() request: RequestWithUser, @Res() response: Response) {
    try {
      const { user } = request;
      const dto: UserDto = {
        id: user.id,
        username: user.username,
        admin: user.admin,
      };
      const cookie = this.authenticationService.getCookieWithJwtToken(user.id);
      response.setHeader('Set-Cookie', cookie);
      return response.send(dto);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  /**
   * logs out the user and removes the jwt token
   * @param request
   * @param response
   */
  @UseGuards(jwtAuthenticationGuard)
  @Post('logEntry-out')
  async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
    response.setHeader(
      'set-Cookie',
      this.authenticationService.getCookieForLogOut(),
    );
    return response.sendStatus(200);
  }

  /**
   * gets a user
   * @param request
   */
  @UseGuards(jwtAuthenticationGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    const user = request.user;
    const dto: UserDto = {
      id: user.id,
      username: user.username,
      admin: user.admin,
    };
    console.log(dto);
    return dto;
  }
}
