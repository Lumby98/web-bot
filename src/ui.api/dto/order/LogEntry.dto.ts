import { OrderErrorDto } from './OrderError.dto';
import { LogOrderDto } from "./LogOrder.dto";

export class LogEntryDto {
  id: number;
  status: boolean;
  desc: string;
  process: string;
  timestamp: Date;
  order?: LogOrderDto;
  err?: OrderErrorDto;
}
