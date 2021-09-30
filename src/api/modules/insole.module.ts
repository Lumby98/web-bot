import { Module } from '@nestjs/common';
import { InsoleService } from '../../core/service/insole.service';
import { InsoleController } from '../controllers/insole.controller';

@Module({
  controllers: [InsoleController],
  providers: [InsoleService],
})
export class InsoleModule {}
