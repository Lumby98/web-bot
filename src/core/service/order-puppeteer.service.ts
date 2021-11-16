import { Inject, Injectable } from '@nestjs/common';
import { OrderPuppeteerInterface } from '../interfaces/order-puppeteer.interface';
import { OrderModel } from '../models/order.model';

@Injectable()
export class OrderPuppeteerService implements OrderPuppeteerInterface {
  /**
   * Takes a list of order-numbers and uses puppeteer to find the corresponding orders on Ortowear's site
   * and retrieve their data.
   * @param orderNumbers
   */
  findData(orderNumbers: string[]): Promise<OrderModel[]> {
    return Promise.resolve([]);
  }
}
