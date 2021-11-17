import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../service/order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HultaforsProduct } from '../../infrastructure/entities/hultafors.product.entity';
import { Repository } from 'typeorm';
import {
  OrderPuppeteerInterface,
  orderPuppeteerInterfaceProvider,
} from '../interfaces/order-puppeteer.interface';
import { OrderPuppeteerService } from '../service/order-puppeteer.service';
import { OrderModel } from '../models/order.model';
import { STSOrderModel } from '../models/sts-order.model';

jest.mock('src/core/service/order-puppeteer.service.ts');

describe('OrderService', () => {
  let orderService: OrderService;
  let orderPuppeteerService: OrderPuppeteerInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        OrderPuppeteerService,
        {
          provide: orderPuppeteerInterfaceProvider,
          useClass: OrderPuppeteerService,
        },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    orderPuppeteerService = module.get<OrderPuppeteerService>(
      OrderPuppeteerService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(orderService).toBeDefined();
  });

  describe('startPuppeteer', () => {
    const validURL = 'https://www.google.com/';

    describe('when startPuppeteer is called', () => {
      beforeEach(async () => {
        await orderService.startPuppeteer(validURL);
      });

      it('then it should call the order-puppeteer.service start method', async () => {
        expect(orderPuppeteerService.start).toBeCalledWith(false, validURL);
      });
    });
  });
});
