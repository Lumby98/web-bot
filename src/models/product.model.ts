import { Status } from '../enums/status.enum';

export interface ProductModel {
  articleName: string;
  articleNo: string;
  brand: string;
  status?: Status;
}
