import { CreateOrderErrorDto } from '../../ui.api/dto/log/error/create-order-error.dto';
import { ErrorLogModel } from '../models/logEntry/error-log.model';
import { UpdateOrderErrorDto } from '../../ui.api/dto/log/error/update-order-error.dto';
import { ErrorEntity } from '../../infrastructure/entities/error.entity';

export const logErrorInterfaceProvider = 'logErrorInterfaceProvider';

export interface logErrorInterface {
  create(logError: CreateOrderErrorDto): Promise<ErrorLogModel>;
  findOne(id: number): Promise<ErrorLogModel>;
  find(): Promise<ErrorLogModel[]>;
  update(id: number, updateError: UpdateOrderErrorDto);
  remove(id: number);
  findByMessage(message: string): Promise<ErrorEntity>;
  errorCheck(errorString: string): Promise<boolean>;
}
