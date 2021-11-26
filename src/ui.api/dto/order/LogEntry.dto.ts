import { OrderDto } from './order.dto';
import { OrderError } from './OrderError';

export class LogEntryDto {
  id: number;
  status: boolean;
  desc: string;
  process: string;
  timestamp: string;
  order?: OrderDto;
  err?: OrderError;
}
