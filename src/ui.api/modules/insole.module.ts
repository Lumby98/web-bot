import { Module } from '@nestjs/common';
import { InsoleService } from '../../core/application.services/implementations/insole-registration/insole.service';
import { InsoleController } from '../controllers/insole.controller';
import { InsoleGateway } from '../gateway/insole.gateway';
import { insoleInterfaceProvider } from '../../core/application.services/interfaces/insole-registration/insole.interface';
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
