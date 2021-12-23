import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  OrderRegistrationFacadeInterface,
  orderRegistrationFacadeInterfaceProvider,
} from '../../core/facades/interfaces/order-registration-facade.interface';
import { OrderRegistrationDto } from '../dto/order-registration/order-registration.dto';
import { OrderLists } from '../../core/models/order-lists';
import { STSOrderModel } from '../../core/models/sts-order.model';
import { AllocationDto } from '../dto/order-registration/allocation-dto';
import { AllocationTestDto } from '../dto/order-registration/allocationTest.dto';
import {
  OrderRegistrationInterface,
  orderRegistrationInterfaceProvider,
} from '../../core/application.services/interfaces/order-registration/order/order-registration.interface';

@Controller('orderRegistration')
export class OrderRegistrationController {
  constructor(
    @Inject(orderRegistrationFacadeInterfaceProvider)
    private readonly orderRegistrationFacade: OrderRegistrationFacadeInterface,
    @Inject(orderRegistrationInterfaceProvider)
    private readonly orderRegistrationService: OrderRegistrationInterface,
  ) {}

  @Post('getOrderInfo')
  async getOrderInfo(@Body() order: OrderRegistrationDto) {
    const orders = await this.orderRegistrationFacade.getOrderInfo(
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
    /*const newDate = new Date();
    newDate.setDate(newDate.getDate() + 90);
    allocationTestDto.orderWithLogs.order.timeOfDelivery = newDate;*/
    const date = new Date(
      allocationTestDto.year,
      allocationTestDto.month - 1,
      allocationTestDto.date,
    );
    allocationTestDto.orderWithLogs.order.timeOfDelivery = date;

    const completedOrders =
      await this.orderRegistrationFacade.handleAllocations(
        allocationTestDto.orderWithLogs,
        allocationTestDto.username,
        allocationTestDto.password,
        allocationTestDto.dev,
        allocationTestDto.completeOrder,
        allocationTestDto.dateBuffer,
      );

    return completedOrders;
  }

  @Post('createOrder')
  async createOrders(@Body() order: AllocationDto) {
    const createdOrders = await this.orderRegistrationFacade.createOrder(
      order.orderList,
      order.username,
      order.password,
      order.dev,
      order.completeOrder,
    );

    return createdOrders;
  }

  @Get('getNextDayOfWeekTest')
  async getNextDayOfWeek(
    @Query('date') date: string,
    @Query('dayOfWeek') dayOfWeek: number,
  ) {
    const formatedDate = this.orderRegistrationService.formatDeliveryDate(date);
    return this.orderRegistrationService.getNextDayOfWeek(
      formatedDate,
      dayOfWeek,
    );
  }
}
