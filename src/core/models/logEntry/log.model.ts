import { ProcessStepEnum } from '../../enums/processStep.enum';
import { OrderLogModel } from './order-log.model';
import { ErrorLogModel } from './error-log.model';

export interface LogModel {
  id: number;
  status: boolean;
  process: ProcessStepEnum;
  timestamp: Date;
  order: OrderLogModel;
  error?: ErrorLogModel;
}
