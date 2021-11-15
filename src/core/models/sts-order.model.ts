import { OrderModel } from './order.model';
import { OrderInsoleModel } from './order-insole.model';

export interface STSOrderModel extends OrderModel {
  width: string;
  size: string;
  model: string;
  sole: string;
  toeCap: string;
  insole: OrderInsoleModel;
}
