import { Status } from '../../enums/status.enum';

export interface ProductModel {
  articleName: string;
  articleNo: string;
  brandName: string;
  status?: Status;
}
