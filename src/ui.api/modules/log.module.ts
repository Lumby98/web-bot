import { Module } from '@nestjs/common';
import { LogService } from '../../core/service/log/log.service';
import { LogController } from '../controllers/log.controller';
import { logInterfaceProvider } from '../../core/interfaces/log.interface';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntity } from '../../infrastructure/entities/log.entity';
import { OrderEntity } from '../../infrastructure/entities/order.entity';
import { ErrorEntity } from '../../infrastructure/entities/error.entity';
import { logErrorInterfaceProvider } from '../../core/interfaces/log-error.interface';
import { orderInterfaceProvider } from '../../core/interfaces/order.interface';
import { OrderService } from '../../core/service/log/order.service';
import { LogErrorService } from '../../core/service/log/log-error.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntity, OrderEntity, ErrorEntity])],
  controllers: [LogController],
  providers: [
    { provide: logInterfaceProvider, useClass: LogService },
    { provide: orderInterfaceProvider, useClass: OrderService },
    { provide: logErrorInterfaceProvider, useClass: LogErrorService },
  ],
})
export class LogModule {}
