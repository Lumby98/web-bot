import { OrderRegistrationDto } from '../../order-registration/order-registration.dto';
import { OrderErrorDto } from '../error/order-error.dto';
import { ProcessStepEnum } from '../../../../core/enums/processStep.enum';
import { LogOrderDto } from "../order/log-order.dto";
import { CreateLogOrderDto } from "../order/create-log-order.dto";
import { CreateOrderErrorDto } from "../error/create-order-error.dto";

export interface CreateLogDto {
  status: boolean;
  process: ProcessStepEnum;
  timestamp: Date;
  order: CreateLogOrderDto;
  error?: CreateOrderErrorDto;
}
