import { CreateLogDto } from '../../ui.api/dto/log/logEntry/create-log.dto';
import { OrderInfoModel } from './order-info.model';

export interface OrderWithLogs {
  order: OrderInfoModel;
  insole: boolean;
  logEntries: Array<CreateLogDto>;

}
