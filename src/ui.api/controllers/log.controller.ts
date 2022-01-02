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
} from '@nestjs/common';
import { CreateLogDto } from '../dto/log/logEntry/create-log.dto';
import {
  LogInterface,
  logInterfaceProvider,
} from '../../core/application.services/interfaces/log/log.interface';
import {
  OrderInterface,
  orderInterfaceProvider,
} from '../../core/application.services/interfaces/log/order.interface';
import {
  LogErrorInterface,
  logErrorInterfaceProvider,
} from '../../core/application.services/interfaces/log/log-error.interface';
import { QueryDto } from '../dto/filter/query.dto';
import { LogEntryDto } from '../dto/log/logEntry/log-entry.dto';
import { PaginationDto } from '../dto/filter/pagination-dto';
import { UpdateLogDto } from '../dto/log/logEntry/update-log.dto';

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

  /**
   * creates a single log
   * @param createLogDto
   */
  @Post()
  async create(@Body() createLogDto: CreateLogDto): Promise<LogEntryDto> {
    try {
      return JSON.parse(
        JSON.stringify(await this.logService.create(createLogDto)),
      );
    } catch (err) {
      console.log(err.message);
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * creates a number of logs
   * @param createLogDtos
   */
  @Post('createAll')
  async createAll(
    @Body() createLogDtos: CreateLogDto[],
  ): Promise<LogEntryDto[]> {
    try {
      return JSON.parse(
        JSON.stringify(await this.logService.createAll(createLogDtos)),
      );
    } catch (err) {
      console.log(err.message);
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * updates a single log entry
   * @param updateLogDto
   */
  @Patch()
  async update(@Body() updateLogDto: UpdateLogDto): Promise<LogEntryDto> {
    try {
      return JSON.parse(
        JSON.stringify(await this.logService.update(updateLogDto)),
      );
    } catch (err) {
      console.log(err.message);
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * finds all logs matching the query and paginates them
   * @param query
   */
  @Get()
  async findAll(@Query() query: QueryDto): Promise<PaginationDto<LogEntryDto>> {
    try {
      return JSON.parse(JSON.stringify(await this.logService.findAll(query)));
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * finds one log entry based on id
   * @param id
   */
  @Get('one/:id')
  async findOne(@Param('id') id: string): Promise<LogEntryDto> {
    try {
      return JSON.parse(JSON.stringify(await this.logService.findOne(+id)));
    } catch (err) {
      console.log(err.message);
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * deletes one entry based on id
   * @param id
   */
  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    try {
      return await this.logService.remove(+id);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * deletes all logs
   */
  @Delete('deleteAll')
  async removeAll() {
    try {
      return await this.logService.removeAll();
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * finds an order from id
   * @param id
   */
  @Get('order/:id')
  async findOrder(@Param('id') id: string) {
    try {
      return await this.orderService.findOne(+id);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * finds an error from id
   * @param id
   */
  @Get('Error/:id')
  async findError(@Param('id') id: string) {
    try {
      return await this.errorService.findOne(+id);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
