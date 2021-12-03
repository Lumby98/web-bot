import { ProcessStepEnum } from '../../../../core/enums/processStep.enum';
import { CreateLogOrderDto } from '../order/create-log-order.dto';
import { CreateOrderErrorDto } from '../error/create-order-error.dto';

export interface CreateLogDto {
  status: boolean;
  process: ProcessStepEnum;
  timestamp: Date;
  order: CreateLogOrderDto;
  error?: CreateOrderErrorDto;
}
