import { OrderModel } from '../models/order.model';
export const orderPuppeteerInterfaceProvider =
  'orderPuppeteerInterfaceProvider';
export interface OrderPuppeteerInterface {
  findData(orderNumbers: string[]): Promise<OrderModel[]>;
}
