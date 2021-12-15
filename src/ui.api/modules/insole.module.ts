import { Module } from '@nestjs/common';
import { InsoleService } from '../../core/service/insole.service';
import { InsoleController } from '../controllers/insole.controller';
import { InsoleGateway } from '../gateway/insole.gateway';
import { insoleInterfaceProvider } from '../../core/interfaces/insole.interface';
import { AuthenticationModule } from './authentication.module';

@Module({
  controllers: [InsoleController],
  providers: [
    { provide: insoleInterfaceProvider, useClass: InsoleService },
    InsoleGateway,
  ],
  imports: [AuthenticationModule],
})
export class InsoleModule {}
