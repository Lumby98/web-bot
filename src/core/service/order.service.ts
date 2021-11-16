import { OrderInterface } from '../interfaces/order.interface';
import { Inject, Injectable } from '@nestjs/common';
import {
  OrderPuppeteerInterface,
  orderPuppeteerInterfaceProvider,
} from '../interfaces/order-puppeteer.interface';
import { OrderModel } from '../models/order.model';

@Injectable()
export class OrderService implements OrderInterface {
  constructor(
    @Inject(orderPuppeteerInterfaceProvider)
    private readonly orderPuppeteer: OrderPuppeteerInterface,
  ) {}

  /**
   * Takes a list of order-numbers and then calls the appropriate puppeteer methods,
   * in order to retrive and return a complete list og order object with all the correct data.
   * @param orderNumbers
   */
  async handleOrders(orderNumbers: string[]): Promise<OrderModel[]> {
    return Promise.resolve(undefined);
  }
}
