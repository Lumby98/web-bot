import { STSOrderModel } from '../models/sts-order.model';
import { KeyInput } from 'puppeteer';
import { string } from '@hapi/joi';
import { TargetAndSelector } from '../models/target-and-selector';
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
  checkLocation(
    selector: string,
    hidden: boolean,
    visible: boolean,
  ): Promise<boolean>;
  getCurrentURL(): string;
  readSelectorText(selector: string): Promise<string>;
  wait(selector?: string, timeout?: number);
  loginNeskrid(username: string, password: string);
  input(selector: string, text: string);
  press(key: KeyInput);
  click(selector: string, hover: boolean);
  dropdownSelect(selector: string, textValue: string);
  selectByTexts(selector: string, textValue: string);
  getModelText(selector: string): Promise<string[]>;
  getInputValue(selector: string): Promise<string>;
  getTableTargetandSelector(orderNumber: string): Promise<TargetAndSelector>;
}
