import { STSOrderModel } from './sts-order.model';
import { INSSOrderModel } from './ins-s-order.model';
import { CreateLogDto } from '../../ui.api/dto/log/logEntry/create-log.dto';

export interface OrderList {
  STSOrder: STSOrderModel;
  INSOrder: INSSOrderModel;
  logEntries: Array<CreateLogDto>;
}
