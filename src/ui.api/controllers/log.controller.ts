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
import { LogEntryDto } from '../dto/log/logEntry/log-entry.dto';
import {
  OrderInterface,
  orderInterfaceProvider,
} from '../../core/interfaces/order.interface';
import {
  LogErrorInterface,
  logErrorInterfaceProvider,
} from '../../core/interfaces/log-error.interface';

@Controller('log')
export class LogController {
  constructor(
    @Inject(logInterfaceProvider)
    private readonly logService: LogInterface,
    @Inject(orderInterfaceProvider)
    private readonly orderService: OrderInterface,
    @Inject(logErrorInterfaceProvider)
    private readonly errorService: LogErrorInterface,
  ) {}

  @Post()
  async create(@Body() createLogDto: CreateLogDto): Promise<LogEntryDto> {
    try {
      return JSON.parse(
        JSON.stringify(await this.logService.create(createLogDto)),
      );
    } catch (err) {
      console.log(err.message);
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(@Query() query: QueryDto): Promise<LogEntryDto[]> {
    try {
      return JSON.parse(JSON.stringify(await this.logService.findAll(query)));
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<LogEntryDto> {
    try {
      return JSON.parse(JSON.stringify(await this.logService.findOne(+id)));
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    try {
      return await this.logService.remove(+id);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('deleteAll')
  async removeAll() {
    return await this.logService.removeAll();
  }

  @Get('order/:id')
  async findOrder(@Param('id') id: string) {
    return await this.orderService.findOne(+id);
  }

  @Get('Error/:id')
  async findError(@Param('id') id: string) {
    return await this.errorService.findOne(+id);
  }
}
