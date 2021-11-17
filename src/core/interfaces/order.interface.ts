import { OrderModel } from '../models/order.model';
export const orderInterfaceProvider = 'orderInterfaceProvider';
export interface OrderInterface {
  handleOrders(orderNumbers: string[]): Promise<OrderModel[]>;
  startPuppeteer(url: string);
  stopPuppeteer();
}
