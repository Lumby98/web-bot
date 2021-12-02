import { Inject, Injectable } from '@nestjs/common';
import { CreateLogDto } from '../../../ui.api/dto/log/logEntry/create-log.dto';
import { UpdateLogDto } from '../../../ui.api/dto/log/logEntry/update-log.dto';
import { LogInterface } from '../../interfaces/log.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { LogEntity } from '../../../infrastructure/entities/log.entity';
import { Like, Repository } from 'typeorm';
import { LogModel } from '../../models/logEntry/log.model';
import {
  OrderInterface,
  orderInterfaceProvider,
} from '../../interfaces/order.interface';
import {
  logErrorInterface,
  logErrorInterfaceProvider,
} from '../../interfaces/log-error.interface';
import { QueryDto } from '../../../ui.api/dto/filter/query.dto';
import { PaginationDto } from '../../../ui.api/dto/filter/pagination-dto';
import { OrderLogModel } from '../../models/logEntry/order-log.model';

@Injectable()
export class LogService implements LogInterface {
  constructor(
    @InjectRepository(LogEntity)
    private logRepository: Repository<LogEntity>,
    @Inject(orderInterfaceProvider)
    private orderService: OrderInterface,
    @Inject(logErrorInterfaceProvider)
    private logErrorService: logErrorInterface,
  ) {}

  /**
   *
   * @param createLogDto
   */
  async create(createLogDto: CreateLogDto) {
    const log = this.logRepository.create();
    log.process = createLogDto.process;
    log.status = createLogDto.status;
    log.timeStamp = createLogDto.timestamp;

    const orderCheck = await this.orderService.checkOrder(
      createLogDto.order.orderNr,
    );

    let order;
    if (!orderCheck) {
      order = await this.orderService.create(createLogDto.order);
      log.order = {
        id: order.id,
        orderNr: order.orderNr,
        completed: order.completed,
        logs: [],
      };
    } else {
      order = await this.orderService.findByOrderNumber(
        createLogDto.order.orderNr,
      );
      log.order = order;
    }

    if (createLogDto.error) {
      const errorCheck = await this.logErrorService.errorCheck(
        createLogDto.error.errorMessage,
      );

      let logError;
      if (!errorCheck) {
        logError = await this.logErrorService.create(createLogDto.error);
        log.error = {
          id: logError.id,
          errorMessage: logError.errorMessage,
          logs: [],
        };
      } else {
        logError = this.logErrorService.findByMessage(log.error.errorMessage);
        log.error = logError;
      }
    }

    return JSON.parse(JSON.stringify(await this.logRepository.save(log)));
  }

  async findAll(query: QueryDto): Promise<PaginationDto<LogModel>> {
    const take = query.take || 10;
    const skip = query.skip || 0;
    const keyword = query.keyword || '';

    const [result, total] = await this.logRepository.findAndCount({
      where: { order: { orderNr: Like('%' + keyword + '%') } },
      relations: ['order', 'error'],
      order: { timeStamp: 'DESC' },
      take: take,
      skip: skip,
    });

    const models = JSON.parse(JSON.stringify(result));

    return {
      data: models,
      count: total,
    };
  }

  async findOne(id: number): Promise<LogModel> {
    const log = await this.logRepository.findOne(id, {
      relations: ['order', 'error'],
    });
    if (!log) {
      throw new Error('log with this id does not exist');
    }

    return JSON.parse(JSON.stringify(log));
  }

  async remove(id: number) {
    try {
      const log = await this.findOne(id);

      return await this.logRepository.delete(id);
    } catch (err) {
      throw new Error('failed to delete: could not find');
    }
  }

  async removeAll() {
    await this.logRepository.clear();
  }
}
