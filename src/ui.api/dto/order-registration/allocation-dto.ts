import { OrderList } from '../../../core/models/order-list';

export class AllocationDto {
  orderList: OrderList;
  username: string;
  password: string;
  dev: boolean;
  completeOrder: boolean;
}
