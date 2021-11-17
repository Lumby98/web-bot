import { Controller, Get, Inject, Param } from '@nestjs/common';
import {
  OrderInterface,
  orderInterfaceProvider,
} from '../../core/interfaces/order.interface';

@Controller('order')
export class OrderController {
  constructor(
    @Inject(orderInterfaceProvider)
    private readonly orderService: OrderInterface,
  ) {}

  @Get('start')
  async startPuppeteer() {
    await this.orderService.startPuppeteer('https://pptr.dev/');
  }

  @Get('stop')
  async stopPuppeteer() {
    await this.orderService.stopPuppeteer();
  }
}
