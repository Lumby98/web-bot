import { Inject, Injectable } from '@nestjs/common';
import { CreateLogDto } from '../../../../ui.api/dto/log/logEntry/create-log.dto';
import { UpdateLogDto } from '../../../../ui.api/dto/log/logEntry/update-log.dto';
import { LogInterface } from '../../interfaces/log/log.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { LogEntity } from '../../../../infrastructure/entities/log.entity';
import { Connection, EntityManager, Like, Repository } from 'typeorm';
import { LogModel } from '../../../models/logEntry/log.model';
import {
  OrderInterface,
  orderInterfaceProvider,
} from '../../interfaces/log/order.interface';
import {
  LogErrorInterface,
  logErrorInterfaceProvider,
} from '../../interfaces/log/log-error.interface';
import { QueryDto } from '../../../../ui.api/dto/filter/query.dto';
import { PaginationDto } from '../../../../ui.api/dto/filter/pagination-dto';
import { NeskridModel } from '../../../models/neskrid.model';
import { NeskridProduct } from '../../../../infrastructure/entities/neskrid.product.entity';
import { log } from 'util';

@Injectable()
export class LogService implements LogInterface {
  constructor(
    @InjectRepository(LogEntity)
    private logRepository: Repository<LogEntity>,
    @Inject(orderInterfaceProvider)
    private orderService: OrderInterface,
    @Inject(logErrorInterfaceProvider)
    private logErrorService: LogErrorInterface,
    private connection: Connection,
  ) {}

  /**
   *
   * @param createLogDto
   */
  async create(createLogDto: CreateLogDto): Promise<LogModel> {
    const log = this.logRepository.create();
    log.process = createLogDto.process;
    log.status = createLogDto.status;
    log.timestamp = createLogDto.timestamp;
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
      log.order.completed = createLogDto.order.completed;
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
        logError = await this.logErrorService.findByMessage(
          createLogDto.error.errorMessage,
        );
        log.error = logError;
      }
    }

    return JSON.parse(JSON.stringify(await this.logRepository.save(log)));
  }

  /**
   *
   * @param createLogDto
   * @param manager
   */
  async createWithEntityManager(
    createLogDto: CreateLogDto,
    manager: EntityManager,
  ): Promise<LogModel> {
    const log = manager.create(LogEntity);
    log.process = createLogDto.process;
    log.status = createLogDto.status;
    log.timestamp = createLogDto.timestamp;

    const orderCheck = await this.orderService.checkOrderWithEntityManager(
      createLogDto.order.orderNr,
      manager,
    );

    let order;
    if (!orderCheck) {
      order = await this.orderService.createWithEntityManager(
        createLogDto.order,
        manager,
      );
      log.order = {
        id: order.id,
        orderNr: order.orderNr,
        completed: order.completed,
        logs: [],
      };
    } else {
      order = await this.orderService.findByOrderNumberWithEntityManager(
        createLogDto.order.orderNr,
        manager,
      );
      log.order = order;
      log.order.completed = createLogDto.order.completed;
    }

    if (createLogDto.error) {
      const errorCheck = await this.logErrorService.errorCheckWithEntityManager(
        createLogDto.error.errorMessage,
        manager,
      );

      let logError;
      if (!errorCheck) {
        logError = await this.logErrorService.createWithEntityManager(
          createLogDto.error,
          manager,
        );
        log.error = {
          id: logError.id,
          errorMessage: logError.errorMessage,
          displayErrorMessage: logError.displayErrorMessage,
          logs: [],
        };
      } else {
        logError = await this.logErrorService.findByMessageWithEntityManager(
          createLogDto.error.errorMessage,
          manager,
        );
        log.error = logError;
      }
    }

    return JSON.parse(JSON.stringify(await manager.save(LogEntity, log)));
  }

  /**
   * creates a number of products in the database at the same time using a transaction.
   * @param logsToCreate
   */
  async createAll(logsToCreate: CreateLogDto[]): Promise<LogModel[]> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const logs: LogModel[] = [];
      for (const logToCreate of logsToCreate) {
        logs.push(
          await this.createWithEntityManager(logToCreate, queryRunner.manager),
        );
      }
      await queryRunner.commitTransaction();
      return logs;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: QueryDto): Promise<PaginationDto<LogModel>> {
    let take = query.take;
    if (!query.take || query.take < 1) {
      take = 10;
    }

    console.log(take + 'take');

    let page = query.page;
    if (!query.page || query.page < 1) {
      page = 1;
    }

    console.log(page + 'page');

    const keyword = query.keyword || '';
    const skip = (page - 1) * take;
    console.log(skip + 'skip');

    const [result, total] = await this.logRepository.findAndCount({
      where: { order: { orderNr: Like('%' + keyword + '%') } },
      relations: ['order', 'error'],
      order: { timestamp: 'DESC' },
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

  async update(updateLogDto: UpdateLogDto): Promise<LogModel> {
    const logFromDatabase = await this.logRepository.findOne({
      where: { id: updateLogDto.id },
      relations: ['order', 'error'],
    });

    if (!logFromDatabase) {
      throw new Error(
        'This log does not exist, cant update a non existing log',
      );
    }

    const orderCheck = await this.orderService.checkOrder(
      updateLogDto.order.orderNr,
    );

    let order;
    if (!orderCheck) {
      order = await this.orderService.create(updateLogDto.order);
      logFromDatabase.order = {
        id: order.id,
        orderNr: order.orderNr,
        completed: order.completed,
        logs: [],
      };
    } else {
      order = await this.orderService.findByOrderNumber(
        updateLogDto.order.orderNr,
      );
      logFromDatabase.order = order;
      logFromDatabase.order.completed = updateLogDto.order.completed;
      await this.orderService.update(
        logFromDatabase.order.id,
        logFromDatabase.order,
      );
    }

    if (updateLogDto.error) {
      const errorCheck = await this.logErrorService.errorCheck(
        updateLogDto.error.errorMessage,
      );

      let logError;
      if (!errorCheck) {
        logError = await this.logErrorService.create(updateLogDto.error);
        logFromDatabase.error = {
          id: logError.id,
          errorMessage: logError.errorMessage,
          displayErrorMessage: logError.displayErrorMessage,
          logs: [],
        };
      } else {
        logError = await this.logErrorService.findByMessage(
          updateLogDto.error.errorMessage,
        );
        logFromDatabase.error = logError;
        logFromDatabase.error.displayErrorMessage =
          updateLogDto.error.displayErrorMessage;
        await this.logErrorService.update(
          logFromDatabase.error.id,
          logFromDatabase.error,
        );
      }
    }

    logFromDatabase.status = updateLogDto.status;
    logFromDatabase.process = updateLogDto.process;
    logFromDatabase.timestamp = updateLogDto.timestamp;

    return JSON.parse(
      JSON.stringify(await this.logRepository.save(logFromDatabase)),
    );
  }
}
