import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from '../../core/service/authentication.service';
import { RegisterDto } from '../dto/authentication/register.dto';
import { LocalAuthenticationGuard } from '../guard/localAuthentication.guard';
import { RequestWithUser } from '../../authentication/interface/requestWithUser.interface';
import { Response } from 'express';
import { jwtAuthenticationGuard } from '../guard/jwt-authentication.guard';
import { UserDto } from '../dto/user/user.dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @UseGuards(jwtAuthenticationGuard)
  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    return this.authenticationService
      .register(registrationData)
      .catch((err) => {
        throw err;
      });
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('log-in')
  async logIn(@Req() request: RequestWithUser, @Res() response: Response) {
    const { user } = request;
    const dto: UserDto = {
      id: user.id,
      username: user.username,
      admin: user.admin,
    };
    const cookie = this.authenticationService.getCookieWithJwtToken(user.id);
    response.setHeader('Set-Cookie', cookie);
    return response.send(dto);
  }

  @UseGuards(jwtAuthenticationGuard)
  @Post('log-out')
  async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
    response.setHeader(
      'set-Cookie',
      this.authenticationService.getCookieForLogOut(),
    );
    return response.sendStatus(200);
  }

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
