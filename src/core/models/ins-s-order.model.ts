import { OrderInfoModel } from './order-info.model';
import { OrderInsoleModel } from './order-insole.model';
import { InputModel } from './input.model';

export interface INSSOrderModel extends OrderInfoModel {
  model: string;
  sizeL: string;
  sizeR: string;
}
