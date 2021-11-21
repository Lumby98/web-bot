import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  savedLoginServiceInterface,
  savedLoginServiceInterfaceProvider,
} from '../../core/interfaces/savedLoginService.interface';
import { jwtAuthenticationGuard } from '../guard/jwt-authentication.guard';
import { InsertSavedLoginDto } from '../dto/savedLogin/insert-SavedLogin.dto';
import { KeyDto } from '../dto/savedLogin/Key.dto';
import { Response } from 'express';
import { LoginTypeEnum } from '../../core/enums/loginType.enum';

@Controller('saved-login')
export class SavedLoginController {
  constructor(
    @Inject(savedLoginServiceInterfaceProvider)
    private readonly savedLoginService: savedLoginServiceInterface,
  ) {}

  @UseGuards(jwtAuthenticationGuard)
  @Post('insert')
  async insert(@Body() insertSavedLoginDto: InsertSavedLoginDto) {
    return this.savedLoginService
      .insertLogin(insertSavedLoginDto)
      .catch((err) => {
        throw err;
      });
  }
  @HttpCode(200)
  @Post('verify')
  async verify(@Body() keyDto: KeyDto, @Res() response: Response) {
    await this.savedLoginService.verifyKey(keyDto.password);
    const login = await this.savedLoginService.getLogin(
      LoginTypeEnum.ORTOWEAR,
      keyDto.password,
    );

    console.log(login);

    return response.send(keyDto);
  }

  //use this later
  // @UseGuards(jwtAuthenticationGuard)
  // @Get()
  // async findAll(@Body() keyModel: KeyModel) { return this.savedLoginService.findAllLogins().catch((err) => {throw err;});}
}
