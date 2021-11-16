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

describe('OrderService', () => {
  let orderService: OrderService;
  let orderPuppeteerService: OrderPuppeteerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: orderPuppeteerInterfaceProvider,
          useClass: OrderPuppeteerService,
        },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    orderPuppeteerService = module.get<OrderPuppeteerInterface>(
      OrderPuppeteerService,
    );
  });

  it('should be defined', () => {
    expect(orderService).toBeDefined();
  });

  describe('handleOrders', () => {
    it('should return a list of orders', async () => {
      const testOrderNumbers: string[] = [
        '10604250',
        'BA 166478',
        '16237136/PO4402074455',
      ];

      const testSTSOrders: STSOrderModel[] = [{model: ''}];
      jest.spyOn(orderPuppeteerService, 'findData').mockResolvedValueOnce();
    });
  });
});
