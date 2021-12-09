import { CreateOrderErrorDto } from './create-order-error.dto';

export interface UpdateOrderErrorDto extends CreateOrderErrorDto {
  id: number;
  displayErrorMessage?: string;
}
