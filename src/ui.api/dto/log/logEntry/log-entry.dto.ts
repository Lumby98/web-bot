import { OrderRegistrationDto } from '../../order-registration/order-registration.dto';
import { OrderErrorDto } from '../error/order-error.dto';
import { LogOrderDto } from '../order/log-order.dto';

export interface LogEntryDto {
  id: number;
  status: boolean;
  process: string;
  timestamp: Date;
  order: LogOrderDto;
  error?: OrderErrorDto;
}
