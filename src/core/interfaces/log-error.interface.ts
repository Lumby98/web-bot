import { CreateOrderErrorDto } from '../../ui.api/dto/log/error/create-order-error.dto';
import { ErrorLogModel } from '../../../../web-bot-frontend/src/app/log/core/models/error-log.model';
import { UpdateOrderErrorDto } from '../../ui.api/dto/log/error/update-order-error.dto';
import { ErrorEntity } from '../../infrastructure/entities/error.entity';
import { QueryDto } from '../../ui.api/dto/filter/query.dto';
import { PaginationDto } from '../../ui.api/dto/filter/pagination-dto';

export const logErrorInterfaceProvider = 'logErrorInterfaceProvider';

export interface LogErrorInterface {
  create(createLogError: CreateOrderErrorDto): Promise<ErrorLogModel>;
  findOne(id: number): Promise<ErrorLogModel>;
  findAll(query: QueryDto): Promise<PaginationDto<ErrorLogModel>>;
  update(id: number, updateError: UpdateOrderErrorDto);
  remove(id: number);
  removeAll();
  findByMessage(message: string): Promise<ErrorEntity>;
  errorCheck(errorString: string): Promise<boolean>;
}
