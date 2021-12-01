import { OrderRegistrationDto } from '../../../ui.api/dto/order-registration/order-registration.dto';
import { OrderErrorDto } from '../../../ui.api/dto/log/error/order-error.dto';

export interface LogModel {
  id: number;
  status: boolean;
  process: string;
  timestamp: Date;
  order: OrderRegistrationDto;
  error?: OrderErrorDto;
}
