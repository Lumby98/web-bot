import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  savedLoginServiceInterface,
  savedLoginServiceInterfaceProvider,
} from '../../core/application.services/interfaces/auth/savedLoginService.interface';
import { jwtAuthenticationGuard } from '../guard/jwt-authentication.guard';
import { InsertSavedLoginDto } from '../dto/savedLogin/insert-SavedLogin.dto';
import { KeyDto } from '../dto/savedLogin/Key.dto';
import { InsertKeyDto } from '../dto/savedLogin/insert-Key.dto';

@Controller('saved-login')
export class SavedLoginController {
  constructor(
    @Inject(savedLoginServiceInterfaceProvider)
    private readonly savedLoginService: savedLoginServiceInterface,
  ) {}

  /**
   * inserts the saved login
   * @param insertSavedLoginDto
   */
  @UseGuards(jwtAuthenticationGuard)
  @Post('insert')
  async insert(@Body() insertSavedLoginDto: InsertSavedLoginDto) {
    return this.savedLoginService
      .insertLogin(insertSavedLoginDto)
      .catch((err) => {
        throw err;
      });
  }

  /**
   * verifies the given key
   * @param keyDto
   */
  @HttpCode(200)
  @Post('verify')
  async verify(@Body() keyDto: KeyDto) {
    await this.savedLoginService.verifyKey(keyDto.password);
  }

  /**
   * changes the key to the given key
   * @param insertKeyDto
   */
  @UseGuards(jwtAuthenticationGuard)
  @HttpCode(200)
  @Post('changeKey')
  async changeKey(@Body() insertKeyDto: InsertKeyDto) {
    await this.savedLoginService.changeKey(insertKeyDto);
  }
}
