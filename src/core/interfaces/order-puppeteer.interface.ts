import { STSOrderModel } from '../models/sts-order.model';
import { KeyInput } from "puppeteer";
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
  readSTSOrder(orderNumber: string): Promise<STSOrderModel>;
  checkLocation(selector: string, hidden: boolean): Promise<boolean>;
  getCurrentURL(): string;
  readSelectorText(selector: string): Promise<string>;
  wait(selector: string);
  loginNeskrid(username: string, password: string);
  input(selector: string, text: string);
  press(key: KeyInput);
  click(selector: string);
  select(selector: string, value: string);
  selectByTexts(text: string);
  getModelText(selector: string): Promise<string[]>;
}
