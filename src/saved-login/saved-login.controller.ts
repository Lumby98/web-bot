import { Body, Controller, Inject, Post, UseGuards, Get } from '@nestjs/common';
import {
  savedLoginServiceInterface,
  savedLoginServiceInterfaceProvider,
} from '../core/interfaces/savedLoginService.interface';
import { jwtAuthenticationGuard } from '../ui.api/guard/jwt-authentication.guard';
import { InsertSavedLoginDto } from '../ui.api/dto/savedLogin/insert-SavedLogin.dto';
import { KeyModel } from '../core/models/key.model';

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

//use this later
// @UseGuards(jwtAuthenticationGuard)
  // @Get()
  // async findAll(@Body() keyModel: KeyModel) { return this.savedLoginService.findAllLogins().catch((err) => {throw err;});}
}
