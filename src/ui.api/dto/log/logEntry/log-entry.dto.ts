import { ProcessStepEnum } from '../../../../core/enums/processStep.enum';
import { OrderErrorDto } from '../error/order-error.dto';

class LogOrderDto {}

export interface LogEntryDto {
  id: number;
  status: boolean;
  process: ProcessStepEnum;
  timestamp: Date;
  order: LogOrderDto;
  error?: OrderErrorDto;
}
