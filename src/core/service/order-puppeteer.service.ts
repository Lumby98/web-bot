import { Inject, Injectable } from '@nestjs/common';
import { OrderPuppeteerInterface } from '../interfaces/order-puppeteer.interface';
import { OrderModel } from '../models/order.model';

@Injectable()
export class OrderPuppeteerService implements OrderPuppeteerInterface {
  puppeteer = require('puppeteer');
  page;
  browser;
  /**
   * Takes a list of order-numbers and uses puppeteer to find the corresponding orders on Ortowear's site
   * and retrieve their data.
   * @param orderNumbers
   */
  findData(orderNumbers: string[]): Promise<OrderModel[]> {
    return Promise.resolve([]);
  }


  async start(headless: boolean, url: string) {
    this.browser = await this.puppeteer.launch({ headless: headless });
    this.page = await this.browser.newPage();
    await this.page.goto(url);
  }

  async doScroll(selector: string) {
    await this.page.click(selector);
  }
  async stop() {
    this.browser.close();
    this.page = undefined;
  }
}
