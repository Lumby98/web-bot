import { OrderInfoModel } from './order-info.model';

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
