import { OrderModel } from './order.model';
import { OrderInsoleModel } from './order-insole.model';

export interface STSOrderModel extends OrderModel {
  widthL: string;
  widthR: string;
  sizeL: string;
  sizeR: string;
  model: string;
  sole: string;
  toeCap: string;
  insole?: boolean;
}
