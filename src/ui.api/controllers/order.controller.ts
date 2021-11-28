import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import {
  OrderInterface,
  orderInterfaceProvider,
} from '../../core/interfaces/order.interface';
import { OrderDto } from '../dto/order/order.dto';
import { OrderLists } from '../../core/models/order-lists';
import { STSOrderModel } from '../../core/models/sts-order.model';
import { AllocationDto } from '../dto/order/allocation-dto';

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

  @Post('handleOrder')
  async handleOrders(@Body() order: OrderDto) {
    const orders = await this.orderService.handleOrders(order.orderNumbers, {
      username: order.username,
      password: order.password,
    });
    console.log(orders);
    const registeredOrders = await this.orderService.createOrder(
      orders,
      'sales@ortowear.com',
      'noqczopj',
      true,
    );

    const completedOrders = await this.orderService.handleAllocations(
      registeredOrders,
      order.username,
      order.password,
      true,
    );

    return completedOrders;
  }

  @Post('allocateOrders')
  async allocateOrders(@Body() allocationDto: AllocationDto) {
    allocationDto.orderLists.STSOrders.forEach((order) => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 7);
      order.timeOfDelivery = newDate;
    });
    const completedOrders = await this.orderService.handleAllocations(
      allocationDto.orderLists,
      allocationDto.username,
      allocationDto.password,
      true,
    );

    return completedOrders;
  }

  @Post('createOrder')
  async createOrders(@Body() order: AllocationDto) {
    const createdOrders = await this.orderService.createOrder(
      order.orderLists,
      order.username,
      order.password,
      true,
    );
    console.log(
      `time of delivery: ${createdOrders.STSOrders[0].timeOfDelivery}`,
    );
    return createdOrders;
  }

  @Get('getNextDayOfWeekTest')
  async getNextDayOfWeekTest(
    @Query('date') date: string,
    @Query('dayOfWeek') dayOfWeek: number,
  ): Promise<Date> {
    const formatedDate = this.orderService.formatDeliveryDate(date);

    return this.orderService.getNextDayOfWeek(formatedDate, dayOfWeek);
  }

  @Get('stop')
  async stopPuppeteer() {
    await this.orderService.stopPuppeteer();
  }
}
