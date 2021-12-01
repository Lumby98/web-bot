import { OrderInfoModel } from './order-info.model';
import { OrderInsoleModel } from './order-insole.model';

export interface STSOrderModel extends OrderInfoModel {
  widthL: string;
  widthR: string;
  sizeL: string;
  sizeR: string;
  model: string;
  sole: string;
  toeCap: string;
  insole?: boolean;
}
