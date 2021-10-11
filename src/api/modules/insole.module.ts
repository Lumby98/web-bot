import { Module } from '@nestjs/common';
import { InsoleService } from '../../core/service/insole.service';
import { InsoleController } from '../controllers/insole.controller';
import { InsoleGateway } from '../gateway/insole.gateway';

@Module({
  controllers: [InsoleController],
  providers: [InsoleService, InsoleGateway],
})
export class InsoleModule {}
