import { OrderModel } from '../models/order.model';
import { STSOrderModel } from '../models/sts-order.model';
import { OrderInsoleModel } from '../models/order-insole.model';
export const orderPuppeteerInterfaceProvider =
  'orderPuppeteerInterfaceProvider';
export interface OrderPuppeteerInterface {
  puppeteer;
  page;
  start(headless: boolean, url: string);
  navigateToURL(url: string);
  loginOrtowear(username: string, password: string);
  stop();
  readType(orderNumber: string): Promise<string>;
  goToOrder(orderNumber: string);
  readSTSOrder(): Promise<STSOrderModel>;
  checkCover(): Promise<boolean>;
  readInsole(): Promise<OrderInsoleModel>;
}
