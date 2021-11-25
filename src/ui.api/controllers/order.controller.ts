import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import {
  OrderInterface,
  orderInterfaceProvider,
} from '../../core/interfaces/order.interface';
import { LoginDto } from '../dto/user/login.dto';
import { OrderDto } from '../dto/order/order.dto';
import { OrderLists } from '../../core/models/order-lists';
import { STSOrderModel } from '../../core/models/sts-order.model';

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
    return await this.orderService.createOrder(
      orders,
      'sales@ortowear.com',
      'noqczopj',
    );
  }

  @Post('createOrder')
  async createOrders() {
    const sts: STSOrderModel[] = [];
    sts.push({
      orderNr: 'VA 166626',
      deliveryAddress: 'Gammel Køge Landevej 55 2500 Valby Kobenhavn, Denmark',
      customerName: 'Holger Hansen Sko ApS',
      model: '9052160 Beaver DUO',
      sizeL: '40',
      sizeR: '40',
      widthL: 'Neskrid 66-11',
      widthR: 'Neskrid 66-11',
      sole: 'N167 DUO Black',
      toeCap: 'Composite',
      EU: true,
      insole: true,
    });
    const orders: OrderLists = { STSOrders: sts, INSOrders: [] };

    return await this.orderService.createOrder(
      orders,
      'sales@ortowear.com',
      'noqczopj',
    );
  }

  @Get('stop')
  async stopPuppeteer() {
    await this.orderService.stopPuppeteer();
  }
}
