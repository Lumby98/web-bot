import { Module } from '@nestjs/common';
import { OrderRegistrationController } from '../controllers/order-registration.controller';
import { orderRegistrationFacadeInterfaceProvider } from '../../core/facades/interfaces/order-registration-facade.interface';
import { OrderRegistrationFacade } from '../../core/facades/implementations/order-registration.facade';
import { puppeteerUtilityInterfaceProvider } from '../../core/domain.services/puppeteer-utility.interface';
import { PuppeteerUtility } from '../../infrastructure/api/puppeteer.utility';
import { OrderRegistrationGateway } from '../gateway/order-registration.gateway';
import { AuthenticationModule } from './authentication.module';
import { LogModule } from './log.module';

@Module({
  imports: [AuthenticationModule, LogModule],
  controllers: [OrderRegistrationController],
  providers: [
    {
      provide: orderRegistrationFacadeInterfaceProvider,
      useClass: OrderRegistrationFacade,
    },
    {
      provide: puppeteerUtilityInterfaceProvider,
      useClass: PuppeteerUtility,
    },
    OrderRegistrationGateway,
  ],
})
export class OrderRegistrationModule {}
