import { Module } from '@nestjs/common';
import { OrderController } from '../controllers/order.controller';
import { orderInterfaceProvider } from '../../core/interfaces/order.interface';
import { OrderService } from '../../core/service/order.service';
import { orderPuppeteerInterfaceProvider } from '../../core/domain.services/order-puppeteer.interface';
import { OrderPuppeteerService } from '../../infrastructure/api/order-puppeteer.service';
import { OrderGateway } from '../gateway/order.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntity } from '../../infrastructure/entities/log.entity';
import { OrderEntity } from '../../infrastructure/entities/order.entity';
import { ErrorEntity } from '../../infrastructure/entities/error.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntity, OrderEntity, ErrorEntity])],
  controllers: [OrderController],
  providers: [
    { provide: orderInterfaceProvider, useClass: OrderService },
    {
      provide: orderPuppeteerInterfaceProvider,
      useClass: OrderPuppeteerService,
    },
    OrderGateway,
  ],
})
export class OrderModule {}
