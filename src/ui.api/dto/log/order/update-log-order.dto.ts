import { CreateLogOrderDto } from './create-log-order.dto';

export interface UpdateLogOrderDto extends CreateLogOrderDto {
  id: number;
}
