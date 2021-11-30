import { Module } from '@nestjs/common';
import { LogService } from '../../core/service/log.service';
import { LogController } from '../controllers/log.controller';
import { logInterfaceProvider } from '../../core/interfaces/log.interface';

@Module({
  controllers: [LogController],
  providers: [{ provide: logInterfaceProvider, useClass: LogService }],
})
export class LogModule {}
