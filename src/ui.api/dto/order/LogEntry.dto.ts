import { OrderDto } from './order.dto';
import { OrderErrorDto } from './OrderError.dto';

export class LogEntryDto {
  id: number;
  status: boolean;
  desc: string;
  process: string;
  timestamp: string;
  order?: OrderDto;
  err?: OrderErrorDto;
}
