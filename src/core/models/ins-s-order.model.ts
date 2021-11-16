import { OrderModel } from './order.model';
import { OrderInsoleModel } from './order-insole.model';
import { InputModel } from './input.model';

export interface INSSOrderModel extends OrderModel {
  patterns: string;
  sizeL: string;
  sizeR: string;
  insole: OrderInsoleModel;
  inputs: InputModel[];
}
