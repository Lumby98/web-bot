import { OrderInterface } from '../interfaces/order.interface';
import { Inject, Injectable } from '@nestjs/common';
import {
  OrderPuppeteerInterface,
  orderPuppeteerInterfaceProvider,
} from '../interfaces/order-puppeteer.interface';
import { OrderModel } from '../models/order.model';
import { STSOrderModel } from '../models/sts-order.model';
import { OrderInsoleModel } from '../models/order-insole.model';

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
  async handleOrders(orderNumbers: string[]): Promise<any[]> {
    return Promise.resolve(undefined);
  }

  /**
   * gets order type for the different order numbers given
   * @param orderNumbers
   */
  async getOrderType(orderNumbers: string): Promise<string> {
    return Promise.resolve(undefined);
  }

  /**
   * get order information for an STS order
   * @param ordernumber
   */
  async handleSTSOrder(ordernumber: string): Promise<STSOrderModel> {
    return Promise.resolve(undefined);
  }

  /**
   * check if an order has an insole
   */
  async checkForInsole(): Promise<boolean> {
    return Promise.resolve(undefined);
  }

  /**
   * gets data for an insole
   */
  async createInsole(): Promise<OrderInsoleModel> {
    return Promise.resolve(undefined);
  }

  /**
   * gets puppeteer up and running
   * @param url
   */
  async startPuppeteer(url: string) {
    await this.orderPuppeteer.start(false, url);
  }

  /**
   * stops puppeteer
   */
  async stopPuppeteer() {
    await this.orderPuppeteer.stop();
  }
}
