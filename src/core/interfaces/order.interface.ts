import { OrderModel } from '../models/order.model';
export const orderInterfaceProvider = 'orderInterfaceProvider';
export interface OrderInterface {
  handleOrders(orderNumbers: string[]): Promise<OrderModel[]>;
  usePuppeteer();
  action(number: string);
  stopPuppeteer();
}
