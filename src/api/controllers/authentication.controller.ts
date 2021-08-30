import {
  Body,
  Controller, Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import { AuthenticationService } from '../../core/service/authentication.service';
import { RegisterDto } from '../dto/authentication/register.dto';
import { LocalAuthenticationGuard } from '../guard/localAuthentication.guard';
import { RequestWithUser } from '../../authentication/interface/requestWithUser.interface';
import { Response } from 'express';
import { jwtAuthenticationGuard } from '../guard/jwt-authentication.guard';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('register')
  async register(@Body() registationData: RegisterDto) {
    return this.authenticationService.register(registationData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('log-in')
  async logIn(@Req() request: RequestWithUser, @Res() response: Response) {
    const { user } = request;
    const cookie = this.authenticationService.getCookieWithJwtToken(user.id);
    response.setHeader('Set-Cookie', cookie);
    user.password = undefined;
    return response.send(user);
  }

  @UseGuards(jwtAuthenticationGuard)
  @Post('log-out')
  async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
    response.setHeader(
      'set-Cookie',
      this.authenticationService.getCokkieForLogOut(),
    );
    return response.sendStatus(200);
  }

  @UseGuards(jwtAuthenticationGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    const user = request.user;
    user.password = undefined;
    return user;
  }
}
