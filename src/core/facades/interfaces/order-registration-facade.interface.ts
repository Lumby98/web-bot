import { LoginDto } from '../../../ui.api/dto/user/login.dto';
import { OrderList } from '../../models/order-list';
import { OrderWithLogs } from '../../models/orderWithLogs';
export const orderRegistrationFacadeInterfaceProvider =
  'orderRegistrationFacadeInterfaceProvider';
export interface OrderRegistrationFacadeInterface {
  getOrderInfo(orderNumber: string, login: LoginDto): Promise<OrderList>;
  createOrder(
    orders: OrderList,
    username: string,
    password: string,
    dev: boolean,
    completeOrder: boolean,
  ): Promise<OrderList>;
  handleAllocations(
    orderWithLogs: OrderWithLogs,
    username: string,
    password: string,
    dev: boolean,
    completeOrder: boolean,
  ): Promise<OrderWithLogs>;
}
