import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InsoleService } from '../../core/service/insole.service';
import { RegisterInsoleDto } from '../dto/insole-upload/register-insole.dto';
@Controller('insole')
export class InsoleController {
  constructor(private readonly insoleService: InsoleService) {}

  @Post()
  async registerInsole(@Body() createInsoleDto: RegisterInsoleDto) {
    try {
      return await this.insoleService.registerInsole(createInsoleDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}
