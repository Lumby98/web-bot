import { Module } from '@nestjs/common';
import { AuthenticationService } from '../../core/service/authentication.service';
import { UserModule } from './user.module';
import { AuthenticationController } from '../controllers/authentication.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '../../core/strategy/local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { jwtStrategy } from '../../core/strategy/jwt.strategy';
import { authenticationInterfaceProvider } from '../../core/interfaces/authentication.interface';
import { savedLoginServiceInterfaceProvider } from '../../core/interfaces/savedLoginService.interface';
import { SavedLoginService } from '../../core/service/SavedLogin.service';
import { SavedLoginController } from '../controllers/saved-login.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedLogin } from '../../infrastructure/entities/Savedlogin.entity';
import { Key } from '../../infrastructure/entities/key';
import { OrderRegistrationModule } from './order-registration.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([SavedLogin, Key]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
        },
      }),
    }),
    OrderRegistrationModule,
  ],
  providers: [
    {
      provide: authenticationInterfaceProvider,
      useClass: AuthenticationService,
    },
    LocalStrategy,
    jwtStrategy,
    {
      provide: savedLoginServiceInterfaceProvider,
      useClass: SavedLoginService,
    },
  ],
  controllers: [AuthenticationController, SavedLoginController],
})
export class AuthenticationModule {}
