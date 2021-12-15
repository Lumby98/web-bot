import { Module } from '@nestjs/common';
import { UserService } from '../../core/service/user.service';
import { UserController } from '../controllers/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../infrastructure/entities/user.entity';
import { userInterfaceProvider } from '../../core/interfaces/user.interface';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [{ provide: userInterfaceProvider, useClass: UserService }],
  exports: [{ provide: userInterfaceProvider, useClass: UserService }],
})
export class UserModule {}
