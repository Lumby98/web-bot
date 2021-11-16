import { OrderModel } from '../models/order.model';
export const orderPuppeteerInterfaceProvider =
  'orderPuppeteerInterfaceProvider';
export interface OrderPuppeteerInterface {
  puppeteer;
  page;
  findData(orderNumbers: string[]): Promise<OrderModel[]>;
  start(headless: boolean, url: string);
  doScroll(selector: string);
  stop();
}
