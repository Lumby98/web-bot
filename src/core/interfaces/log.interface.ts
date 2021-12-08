import { CreateLogDto } from '../../ui.api/dto/log/logEntry/create-log.dto';
import { QueryDto } from '../../ui.api/dto/filter/query.dto';
import { PaginationDto } from '../../ui.api/dto/filter/pagination-dto';
import { LogModel } from '../models/logEntry/log.model';
import { EntityManager } from 'typeorm';
import { UpdateLogDto } from '../../ui.api/dto/log/logEntry/update-log.dto';

export const logInterfaceProvider = 'logInterfaceProvider';
export interface LogInterface {
  remove(id: number);
  removeAll();
  findOne(id: number): Promise<LogModel>;
  findAll(query: QueryDto): Promise<PaginationDto<LogModel>>;
  create(createLogDto: CreateLogDto): Promise<LogModel>;
  update(updateLogDto: UpdateLogDto): Promise<LogModel>;
  createWithEntityManager(
    createLogDto: CreateLogDto,
    manager: EntityManager,
  ): Promise<LogModel>;
  createAll(logsToCreate: CreateLogDto[]): Promise<LogModel[]>;
}
