import { Inject, Injectable } from '@nestjs/common';
import { CreateLogDto } from '../../ui.api/dto/log/logEntry/create-log.dto';
import { UpdateLogDto } from '../../ui.api/dto/log/logEntry/update-log.dto';
import { LogInterface } from '../interfaces/log.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { LogEntity } from '../../infrastructure/entities/log.entity';
import { Repository } from 'typeorm';
import { LogModel } from '../models/logEntry/log.model';
import {
  OrderInterface,
  orderInterfaceProvider,
} from '../interfaces/order.interface';
import {
  logErrorInterface,
  logErrorInterfaceProvider,
} from '../interfaces/log-error.interface';

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

    return JSON.parse(JSON.stringify(await this.logRepository.save(log)));
  }

  async findAll(): Promise<LogModel[]> {
    return JSON.parse(
      JSON.stringify(
        await this.logRepository.find({
          relations: ['order', 'error'],
        }),
      ),
    );
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
