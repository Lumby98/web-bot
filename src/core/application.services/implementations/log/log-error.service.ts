import { Injectable } from '@nestjs/common';
import { LogErrorInterface } from '../../interfaces/log/log-error.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorEntity } from '../../../../infrastructure/entities/error.entity';
import { EntityManager, Like, Repository } from 'typeorm';
import { CreateOrderErrorDto } from '../../../../ui.api/dto/log/error/create-order-error.dto';
import { UpdateOrderErrorDto } from '../../../../ui.api/dto/log/error/update-order-error.dto';
import { QueryDto } from '../../../../ui.api/dto/filter/query.dto';
import { PaginationDto } from '../../../../ui.api/dto/filter/pagination-dto';
import { ErrorLogModel } from '../../../models/logEntry/error-log.model';

@Injectable()
export class LogErrorService implements LogErrorInterface {
  constructor(
    @InjectRepository(ErrorEntity)
    private errorRepository: Repository<ErrorEntity>,
  ) {}
  async create(createLogError: CreateOrderErrorDto): Promise<ErrorLogModel> {
    const errorCheck = await this.errorCheck(createLogError.errorMessage);
    if (errorCheck) {
      throw new Error(
        'Cant create error, an error with this error message already exists',
      );
    }
    const errorEntity = this.errorRepository.create(createLogError);
    return JSON.parse(
      JSON.stringify(await this.errorRepository.save(errorEntity)),
    );
  }

  async createWithEntityManager(
    createLogError: CreateOrderErrorDto,
    manager: EntityManager,
  ): Promise<ErrorLogModel> {
    const errorCheck = await this.errorCheckWithEntityManager(
      createLogError.errorMessage,
      manager,
    );
    if (errorCheck) {
      throw new Error(
        'Cant create error, an error with this error message already exists',
      );
    }
    const errorEntity = manager.create(ErrorEntity, createLogError);
    return JSON.parse(
      JSON.stringify(await manager.save(ErrorEntity, errorEntity)),
    );
  }

  async errorCheck(errorString: string): Promise<boolean> {
    const error = await this.errorRepository.findOne({
      where: { errorMessage: errorString },
    });

    return !!error;
  }

  async errorCheckWithEntityManager(
    errorString: string,
    manager: EntityManager,
  ): Promise<boolean> {
    const error = await manager.findOne(ErrorEntity, {
      where: { errorMessage: errorString },
    });

    return !!error;
  }

  async findAll(query: QueryDto): Promise<PaginationDto<ErrorLogModel>> {
    const take = query.take || 10;
    const skip = query.page || 1;
    const keyword = query.keyword || '';

    const [result, total] = await this.errorRepository.findAndCount({
      where: { errorMessage: Like('%' + keyword + '%') },
      order: { id: 'DESC' },
      take: take,
      skip: (skip - 1) * take,
    });

    const models = JSON.parse(JSON.stringify(result));

    return {
      data: models,
      count: total,
    };
  }

  async findByMessage(message: string): Promise<ErrorEntity> {
    const error = await this.errorRepository.findOne({
      where: { errorMessage: message },
    });
    return error;
  }

  async findByMessageWithEntityManager(
    message: string,
    manager: EntityManager,
  ): Promise<ErrorEntity> {
    const error = await manager.findOne(ErrorEntity, {
      where: { errorMessage: message },
    });
    return error;
  }

  async findOne(id: number): Promise<ErrorLogModel> {
    const error = await this.errorRepository.findOne(id, {
      relations: ['logs'],
    });

    if (!error) {
      throw new Error('could not find error  with given id');
    }

    return JSON.parse(JSON.stringify(error));
  }

  async remove(id: number) {
    try {
      const error = await this.findOne(id);

      return await this.errorRepository.delete(id);
    } catch (err) {
      throw new Error('failed to delete: could not find');
    }
  }

  async removeAll() {
    await this.errorRepository.clear();
  }

  async update(
    id: number,
    updateError: UpdateOrderErrorDto,
  ): Promise<ErrorLogModel> {
    const errorCheck = await this.errorCheck(updateError.errorMessage);

    if (!errorCheck) {
      throw new Error('This error does not exist');
    }

    if (id != updateError.id) {
      throw new Error(
        'Invalid arguments: Provided id and the id of the update dto do not match.',
      );
    }

    const errorByErrorMessage = await this.findByMessage(
      updateError.errorMessage,
    );

    if (updateError.id != errorByErrorMessage.id) {
      throw new Error(
        'Tried changing error message: It is forbidden to change an errors message',
      );
    }

    await this.errorRepository.update({ id: id }, updateError);

    const updatedError = await this.findOne(id);

    if (updateError) {
      if (
        updatedError.errorMessage == updateError.errorMessage &&
        updatedError.id == updateError.id &&
        updatedError.displayErrorMessage == updateError.displayErrorMessage
      ) {
        return updatedError;
      } else {
        throw new Error('Failed to update error');
      }
    } else {
      throw new Error('Failed to update error');
    }
  }
}
