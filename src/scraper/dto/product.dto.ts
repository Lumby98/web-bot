import { Status } from '../../enums/status.enum';

export interface ProductDTO {
  articleName: string;
  articleNo: string;
  brand: string;
  status?: Status;
}
