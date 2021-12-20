import { Module } from '@nestjs/common';
import { OrderRegistrationController } from '../controllers/order-registration.controller';
import { orderRegistrationFacadeInterfaceProvider } from '../../core/facades/interfaces/order-registration-facade.interface';
import { OrderRegistrationFacade } from '../../core/facades/implementations/order-registration.facade';
import { puppeteerUtilityInterfaceProvider } from '../../core/domain.services/puppeteer-utility.interface';
import { PuppeteerUtility } from '../../infrastructure/api/puppeteer.utility';
import { OrderRegistrationGateway } from '../gateway/order-registration.gateway';
import { AuthenticationModule } from './authentication.module';
import { LogModule } from './log.module';
import { orderRegistrationInterfaceProvider } from '../../core/application.services/interfaces/order-registration/order/order-registration.interface';
import { OrderRegistrationService } from '../../core/application.services/implementations/order-registration/order/order-registration.service';
import { puppeteerServiceInterfaceProvider } from '../../core/application.services/interfaces/puppeteer/puppeteer-service.Interface';
import { PuppeteerService } from '../../core/application.services/implementations/order-registration/puppeteer/puppeteer.service';
import { STSInterfaceProvider } from '../../core/application.services/interfaces/order-registration/sts/STS.interface';
import { StsService } from '../../core/application.services/implementations/order-registration/sts/sts.service';
import { iNSSInterfaceProvider } from '../../core/application.services/interfaces/order-registration/ins-s/INSS.interface';
import { InssService } from '../../core/application.services/implementations/order-registration/inss/inss.service';

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
    {
      provide: orderRegistrationInterfaceProvider,
      useClass: OrderRegistrationService,
    },
    {
      provide: puppeteerServiceInterfaceProvider,
      useClass: PuppeteerService,
    },
    {
      provide: STSInterfaceProvider,
      useClass: StsService,
    },
    {
      provide: iNSSInterfaceProvider,
      useClass: InssService,
    },
    OrderRegistrationGateway,
  ],
})
export class OrderRegistrationModule {}
