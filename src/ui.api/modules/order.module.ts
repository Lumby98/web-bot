import { Module } from '@nestjs/common';
import { OrderController } from '../controllers/order.controller';
import { orderInterfaceProvider } from '../../core/interfaces/order.interface';
import { OrderService } from '../../core/service/order.service';
import { orderPuppeteerInterfaceProvider } from '../../core/interfaces/order-puppeteer.interface';
import { OrderPuppeteerService } from '../../core/service/order-puppeteer.service';

@Module({
  controllers: [OrderController],
  providers: [
    { provide: orderInterfaceProvider, useClass: OrderService },
    {
      provide: orderPuppeteerInterfaceProvider,
      useClass: OrderPuppeteerService,
    },
  ],
})
export class OrderModule {}
