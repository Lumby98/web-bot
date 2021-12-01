import { Module } from '@nestjs/common';
import { LogService } from '../../core/service/log.service';
import { LogController } from '../controllers/log.controller';
import { logInterfaceProvider } from '../../core/interfaces/log.interface';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntity } from '../../infrastructure/entities/log.entity';
import { OrderEntity } from '../../infrastructure/entities/order.entity';
import { ErrorEntity } from '../../infrastructure/entities/error.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntity, OrderEntity, ErrorEntity])],
  controllers: [LogController],
  providers: [{ provide: logInterfaceProvider, useClass: LogService }],
})
export class LogModule {}
