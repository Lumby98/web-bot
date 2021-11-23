import { STSOrderModel } from './sts-order.model';
import { INSSOrderModel } from './ins-s-order.model';

export interface OrderLists {
  STSOrders: STSOrderModel[];
  INSOrders: INSSOrderModel[];
}
