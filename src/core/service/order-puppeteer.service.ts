import { Inject, Injectable } from '@nestjs/common';
import { OrderPuppeteerInterface } from '../interfaces/order-puppeteer.interface';
import { OrderModel } from '../models/order.model';
import { OrderInsoleModel } from '../models/order-insole.model';
import { STSOrderModel } from '../models/sts-order.model';

@Injectable()
export class OrderPuppeteerService implements OrderPuppeteerInterface {
  puppeteer = require('puppeteer');
  page;
  browser;

  /**
   * Launches puppeteer in the selected browsing mode,
   * then starts a new page and goes to the given URL.
   * @param headless
   * @param url
   */
  async start(headless: boolean, url: string) {
    this.browser = await this.puppeteer.launch({ headless: headless });
    this.page = await this.browser.newPage();
    await this.page.goto(url);
  }

  /**
   * Closes the browser thus stopping puppeteer,
   * clears the page instance.
   */
  async stop() {
    this.browser.close();
    this.page = undefined;
  }

  /**
   * Checks wether the cover field exists on the page,
   * then returns the corresponding boolean.
   */
  checkCover(): Promise<boolean> {
    return Promise.resolve(false);
  }

  /**
   * Navigates to the orders page
   * using the provided order-number.
   * @param orderNumber
   */
  goToOrder(orderNumber: string) {
    return Promise.resolve(undefined);
  }

  /**
   * Navigates to the given URL.
   * @param url
   */
  navigateToURL(url: string) {
    return Promise.resolve(undefined);
  }

  /**
   * Reads the insole data from the page
   * then creates an orderInsoleModel
   * which it then returns.
   */
  readInsole(): Promise<OrderInsoleModel> {
    return Promise.resolve(undefined);
  }

  /**
   * Reads the data for an STSOrder from the page
   * then creates an STSOrderModel
   * which it returns.
   */
  readSTSOrder(): Promise<STSOrderModel> {
    return Promise.resolve(undefined);
  }

  /**
   * Reads the order type for the order with the given order-number.
   * @param orderNumber
   */
  readType(orderNumber: string): Promise<string> {
    return Promise.resolve('');
  }
}
