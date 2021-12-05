import { ProcessStepEnum } from '../../../../core/enums/processStep.enum';
import { OrderErrorDto } from '../error/order-error.dto';
import { LogOrderDto } from '../order/log-order.dto';

export interface LogEntryDto {
  id: number;
  status: boolean;
  process: ProcessStepEnum;
  timestamp: Date;
  order: LogOrderDto;
  error?: OrderErrorDto;
}
