import { OrderRegistrationDto } from '../../order-registration/order-registration.dto';
import { OrderErrorDto } from '../error/order-error.dto';

export interface CreateLogDto {
  status: boolean;
  process: string;
  timestamp: Date;
  order: OrderRegistrationDto;
  error?: OrderErrorDto;
}
