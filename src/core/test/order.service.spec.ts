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
    orderPuppeteerService = module.get<OrderPuppeteerService>(
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

      const testSTSOrders: STSOrderModel[] = [
        {
          model: 'Beaver DUO',
          orderNr: '36394-2',
          customerName: 'Ortowear',
          deliveryAddress: 'Mukkerten 21 6715 Esbjerg N Ribe, Denmark',
          sizeL: '49',
          sizeR: '49',
          widthL: 'Neskrid 66-12',
          widthR: 'Neskrid 66-12',
          sole: 'N167 Duo Black',
          toeCap: 'Composite',
        },
      ];
      jest
        .spyOn(orderPuppeteerService, 'findData')
        .mockResolvedValueOnce(testSTSOrders);
    });
  });
});
