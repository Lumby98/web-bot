import { OrderModel } from '../models/order.model';
import { OrderTypeEnum } from "../enums/type.enum";
export const orderInterfaceProvider = 'orderInterfaceProvider';
export interface OrderInterface {
  handleOrders(orderNumbers: string[]): Promise<OrderModel[]>;
  startPuppeteer(url: string);
  stopPuppeteer();
  getOrderType(orderNumbers: string): Promise<OrderTypeEnum>
}
