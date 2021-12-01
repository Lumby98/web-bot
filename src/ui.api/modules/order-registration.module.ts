import { Module } from '@nestjs/common';
import { OrderRegistrationController } from '../controllers/order-registration.controller';
import { orderRegistrationInterfaceProvider } from '../../core/interfaces/order-registration.interface';
import { OrderRegistrationService } from '../../core/service/order-registration.service';
import { orderPuppeteerInterfaceProvider } from '../../core/domain.services/order-puppeteer.interface';
import { OrderPuppeteerService } from '../../infrastructure/api/order-puppeteer.service';
import { OrderRegistrationGateway } from '../gateway/order-registration.gateway';

@Module({
  imports: [],
  controllers: [OrderRegistrationController],
  providers: [
    {
      provide: orderRegistrationInterfaceProvider,
      useClass: OrderRegistrationService,
    },
    {
      provide: orderPuppeteerInterfaceProvider,
      useClass: OrderPuppeteerService,
    },
    OrderRegistrationGateway,
  ],
})
export class OrderRegistrationModule {}
