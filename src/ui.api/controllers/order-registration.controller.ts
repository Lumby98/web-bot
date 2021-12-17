import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import {
  OrderRegistrationFacadeInterface,
  orderRegistrationFacadeInterfaceProvider,
} from '../../core/facades/interfaces/order-registration-facade.interface';
import { OrderRegistrationDto } from '../dto/order-registration/order-registration.dto';
import { OrderLists } from '../../core/models/order-lists';
import { STSOrderModel } from '../../core/models/sts-order.model';
import { AllocationDto } from '../dto/order-registration/allocation-dto';
import { AllocationTestDto } from '../dto/order-registration/allocationTest.dto';

@Controller('orderRegistration')
export class OrderRegistrationController {
  constructor(
    @Inject(orderRegistrationFacadeInterfaceProvider)
    private readonly orderRegistrationService: OrderRegistrationFacadeInterface,
  ) {}

  @Post('getOrderInfo')
  async getOrderInfo(@Body() order: OrderRegistrationDto) {
    const orders = await this.orderRegistrationService.getOrderInfo(
      order.orderNumbers[0],
      {
        username: order.username,
        password: order.password,
      },
    );

    return orders;
  }

  @Post('allocateOrders')
  async allocateOrders(@Body() allocationTestDto: AllocationTestDto) {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 90);
    allocationTestDto.orderWithLogs.order.timeOfDelivery = newDate;

    const completedOrders =
      await this.orderRegistrationService.handleAllocations(
        allocationTestDto.orderWithLogs,
        allocationTestDto.username,
        allocationTestDto.password,
        allocationTestDto.dev,
        allocationTestDto.completeOrder,
      );

    return completedOrders;
  }

  @Post('createOrder')
  async createOrders(@Body() order: AllocationDto) {
    const createdOrders = await this.orderRegistrationService.createOrder(
      order.orderList,
      order.username,
      order.password,
      order.dev,
      order.completeOrder,
    );

    return createdOrders;
  }
}
