import { STSOrderModel } from '../models/sts-order.model';
import { KeyInput } from 'puppeteer';
import { TargetAndSelector } from '../models/target-and-selector';
import { OrderInfoModel } from '../models/order-info.model';
import { INSSOrderModel } from '../models/ins-s-order.model';
export const puppeteerUtilityInterfaceProvider =
  'puppeteerUtilityInterfaceProvider';
export interface PuppeteerUtilityInterface {
  puppeteer;
  page;
  start(headless: boolean, url: string);
  navigateToURL(url: string);
  loginOrtowear(username: string, password: string);
  stop();
  readSTSOrder(order: OrderInfoModel): Promise<STSOrderModel>;
  readINSSOrder(order: OrderInfoModel): Promise<INSSOrderModel>;
  readOrder(orderNumber: string): Promise<OrderInfoModel>;
  checkLocation(
    selector: string,
    hidden: boolean,
    visible: boolean,
    timeout?: number,
  ): Promise<boolean>;
  getCurrentURL(): string;
  getCSSofElement(selector: string, property: string): Promise<string>;
  readSelectorText(selector: string): Promise<string>;
  wait(selector?: string, timeout?: number);
  loginNeskrid(username: string, password: string);
  input(selector: string, text: string);
  press(key: KeyInput);
  click(selector: string, hover: boolean, wait: boolean);
  dropdownSelect(selector: string, textValue: string);
  selectByTexts(selector: string, textValue: string);
  getTextsForAll(selector: string): Promise<string[]>;
  getInputValue(selector: string): Promise<string>;
  getTableTargetandSelector(orderNumber: string): Promise<TargetAndSelector>;
  selectDate(date: number): Promise<string>;
  selectDropdownByValue(selector: string, value: string);
  getSelectedValue(selector: string): Promise<string>;
  searchableSelect(value: string): Promise<string>;
  clickRadioButton(selector: string);
  selectInputContainerByArticleName(
    name: string,
    selectorForContainingElement: string,
    brandName: string,
  );
}
