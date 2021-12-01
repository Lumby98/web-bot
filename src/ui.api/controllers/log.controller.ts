import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
} from '@nestjs/common';
import { LogService } from '../../core/service/log.service';
import { CreateLogDto } from '../dto/log/logEntry/create-log.dto';
import { UpdateLogDto } from '../dto/log/logEntry/update-log.dto';
import {
  LogInterface,
  logInterfaceProvider,
} from '../../core/interfaces/log.interface';

@Controller('log')
export class LogController {
  constructor(
    @Inject(logInterfaceProvider)
    private readonly logService: LogInterface,
  ) {}

  @Post()
  create(@Body() createLogDto: CreateLogDto) {
    return this.logService.create(createLogDto);
  }

  @Get()
  findAll() {
    return this.logService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logService.remove(+id);
  }
}
