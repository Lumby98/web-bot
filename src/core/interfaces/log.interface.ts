import { UpdateLogDto } from '../../ui.api/dto/log/logEntry/update-log.dto';
import { CreateLogDto } from '../../ui.api/dto/log/logEntry/create-log.dto';

export const logInterfaceProvider = 'logInterfaceProvider';
export interface LogInterface {
  remove(id: number);
  update(id: number, updateLogDto: UpdateLogDto);
  findOne(id: number);
  findAll();
  create(createLogDto: CreateLogDto);
}
