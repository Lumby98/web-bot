import { OrderInfoModel } from './order-info.model';

export interface INSSOrderModel extends OrderInfoModel {
  model: string;
  sizeL: string;
  sizeR: string;
}
