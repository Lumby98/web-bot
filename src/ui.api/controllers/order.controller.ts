import { Controller, Get, Inject, Param } from "@nestjs/common";
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
    await this.orderService.usePuppeteer();
  }

  @Get('action/:selector')
  async do(@Param('selector') selector: string) {
    console.log(selector);
    await this.orderService.action(selector);
  }

  @Get('stop')
  async stopPuppeteer() {
    await this.orderService.stopPuppeteer();
  }
}
