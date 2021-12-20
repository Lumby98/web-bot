import { Module } from '@nestjs/common';
import { LogService } from '../../core/application.services/implementations/log/log.service';
import { LogController } from '../controllers/log.controller';
import { logInterfaceProvider } from '../../core/application.services/interfaces/log/log.interface';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntity } from '../../infrastructure/entities/log.entity';
import { OrderEntity } from '../../infrastructure/entities/order.entity';
import { ErrorEntity } from '../../infrastructure/entities/error.entity';
import { logErrorInterfaceProvider } from '../../core/application.services/interfaces/log/log-error.interface';
import { orderInterfaceProvider } from '../../core/application.services/interfaces/log/order.interface';
import { OrderService } from '../../core/application.services/implementations/log/order.service';
import { LogErrorService } from '../../core/application.services/implementations/log/log-error.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntity, OrderEntity, ErrorEntity])],
  controllers: [LogController],
  providers: [
    { provide: logInterfaceProvider, useClass: LogService },
    { provide: orderInterfaceProvider, useClass: OrderService },
    { provide: logErrorInterfaceProvider, useClass: LogErrorService },
  ],
  exports: [{ provide: logInterfaceProvider, useClass: LogService }],
})
export class LogModule {}
