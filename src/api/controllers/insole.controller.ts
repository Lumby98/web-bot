import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { InsoleService } from '../../core/service/insole.service';
import { RegisterInsoleDto } from '../dto/insole-upload/register-insole.dto';
import { jwtAuthenticationGuard } from '../guard/jwt-authentication.guard';

@Controller('insole')
export class InsoleController {
  constructor(private readonly insoleService: InsoleService) {}

  /**
   * starts insole registration
   * @param createInsoleDto
   */
  @Post()
  @UseGuards(jwtAuthenticationGuard)
  async registerInsole(@Body() createInsoleDto: RegisterInsoleDto) {
    try {
      return await this.insoleService.registerInsole(createInsoleDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}
