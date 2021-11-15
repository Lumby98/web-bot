import { Inject, Injectable } from '@nestjs/common';
import { OrderPuppeteerInterface } from '../interfaces/order-puppeteer.interface';
import { OrderModel } from '../models/order.model';

@Injectable()
export class OrderPuppeteerService implements OrderPuppeteerInterface {
  constructor() {}

  findData(orderNumbers: string[]): Promise<OrderModel[]> {
    return Promise.resolve([]);
  }
}
