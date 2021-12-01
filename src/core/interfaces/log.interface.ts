import { UpdateLogDto } from '../../ui.api/dto/log/logEntry/update-log.dto';
import { CreateLogDto } from '../../ui.api/dto/log/logEntry/create-log.dto';
import { LogModel } from '../models/logEntry/log.model';

export const logInterfaceProvider = 'logInterfaceProvider';
export interface LogInterface {
  remove(id: number);
  removeAll();
  findOne(id: number): Promise<LogModel>;
  findAll(): Promise<LogModel[]>;
  create(createLogDto: CreateLogDto);
}
