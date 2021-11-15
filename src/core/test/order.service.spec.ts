import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../service/order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HultaforsProduct } from '../../infrastructure/entities/hultafors.product.entity';
import { Repository } from 'typeorm';
import { orderPuppeteerInterfaceProvider } from '../interfaces/order-puppeteer.interface';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderService],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
