import { OrderRegistrationDto } from '../../../ui.api/dto/order-registration/order-registration.dto';
import { OrderErrorDto } from '../../../ui.api/dto/log/error/order-error.dto';
import { ProcessStepEnum } from '../../enums/processStep.enum';

export interface LogModel {
  id: number;
  status: boolean;
  process: ProcessStepEnum;
  timestamp: Date;
  order: OrderRegistrationDto;
  error?: OrderErrorDto;
}
