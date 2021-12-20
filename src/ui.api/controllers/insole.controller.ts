import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { RegisterInsoleDto } from '../dto/insole-upload/register-insole.dto';
import { jwtAuthenticationGuard } from '../guard/jwt-authentication.guard';
import {
  InsoleInterface,
  insoleInterfaceProvider,
} from '../../core/application.services/interfaces/insole-registration/insole.interface';

@Controller('insole')
export class InsoleController {
  constructor(
    @Inject(insoleInterfaceProvider)
    private readonly insoleService: InsoleInterface,
  ) {}

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
