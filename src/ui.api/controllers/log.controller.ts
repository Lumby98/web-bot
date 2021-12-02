import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  HttpException,
  HttpStatus,
  Query,
  HttpCode,
} from '@nestjs/common';
import { LogService } from '../../core/service/log/log.service';
import { CreateLogDto } from '../dto/log/logEntry/create-log.dto';
import { UpdateLogDto } from '../dto/log/logEntry/update-log.dto';
import {
  LogInterface,
  logInterfaceProvider,
} from '../../core/interfaces/log.interface';
import { QueryDto } from '../dto/filter/query.dto';
import { HTTPResponse } from 'puppeteer';

@Controller('log')
export class LogController {
  constructor(
    @Inject(logInterfaceProvider)
    private readonly logService: LogInterface,
  ) {}

  @Post()
  create(@Body() createLogDto: CreateLogDto) {
    try {
      return this.logService.create(createLogDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  findAll(@Query() query: QueryDto) {
    try {
      return this.logService.findAll(query);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    try {
      return this.logService.findOne(+id);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    try {
      return this.logService.remove(+id);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('deleteAll')
  removeAll() {
    return this.logService.removeAll();
  }
}
