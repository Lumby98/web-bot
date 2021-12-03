import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import {
  OrderRegistrationInterface,
  orderRegistrationInterfaceProvider,
} from '../../core/interfaces/order-registration.interface';
import { OrderRegistrationDto } from '../dto/order-registration/order-registration.dto';
import { OrderLists } from '../../core/models/order-lists';
import { STSOrderModel } from '../../core/models/sts-order.model';
import { AllocationDto } from '../dto/order-registration/allocation-dto';

@Controller('orderRegistration')
export class OrderRegistrationController {
  constructor(
    @Inject(orderRegistrationInterfaceProvider)
    private readonly orderRegistrationService: OrderRegistrationInterface,
  ) {}

  @Get('start')
  async startPuppeteer() {
    await this.orderRegistrationService.startPuppeteer('https://pptr.dev/');
  }

  @Post('handleOrders')
  async handleOrders(@Body() order: OrderRegistrationDto) {
    const orders = await this.orderRegistrationService.handleOrders(
      order.orderNumbers,
      {
        username: order.username,
        password: order.password,
      },
    );
    console.log(orders);
    const registeredOrders = await this.orderRegistrationService.createOrder(
      orders,
      'sales@ortowear.com',
      'noqczopj',
      order.dev,
      order.completeOrder,
    );

    const completedOrders =
      await this.orderRegistrationService.handleAllocations(
        registeredOrders,
        order.username,
        order.password,
        order.dev,
        order.completeOrder,
      );

    return completedOrders;
  }

  @Post('allocateOrders')
  async allocateOrders(@Body() allocationDto: AllocationDto) {
    allocationDto.orderLists.STSOrders.forEach((order) => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 90);
      order.timeOfDelivery = newDate;
    });
    const completedOrders =
      await this.orderRegistrationService.handleAllocations(
        allocationDto.orderLists,
        allocationDto.username,
        allocationDto.password,
        allocationDto.dev,
        allocationDto.completeOrder,
      );

    return completedOrders;
  }

  @Post('createOrder')
  async createOrders(@Body() order: AllocationDto) {
    const createdOrders = await this.orderRegistrationService.createOrder(
      order.orderLists,
      order.username,
      order.password,
      order.dev,
      order.completeOrder,
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
    const formatedDate = this.orderRegistrationService.formatDeliveryDate(date);

    return this.orderRegistrationService.getNextDayOfWeek(
      formatedDate,
      dayOfWeek,
    );
  }

  @Get('stop')
  async stopPuppeteer() {
    await this.orderRegistrationService.stopPuppeteer();
  }
}