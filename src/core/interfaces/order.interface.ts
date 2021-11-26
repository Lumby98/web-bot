import { OrderModel } from '../models/order.model';
import { OrderTypeEnum } from '../enums/type.enum';
import { LoginDto } from '../../ui.api/dto/user/login.dto';
import { OrderLists } from '../models/order-lists';
export const orderInterfaceProvider = 'orderInterfaceProvider';
export interface OrderInterface {
  handleOrders(orderNumbers: string[], login: LoginDto): Promise<OrderLists>;
  startPuppeteer(url: string);
  stopPuppeteer();
  getOrderType(orderNumber: string): Promise<OrderTypeEnum>;
  createOrder(
    orders: OrderLists,
    username: string,
    password: string,
  ): Promise<string>;
  handleAllocations(
    orders: OrderLists,
    username: string,
    password: string,
  ): Promise<string>;
}
