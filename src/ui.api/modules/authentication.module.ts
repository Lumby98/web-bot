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

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule,
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
  ],
  providers: [
    {
      provide: authenticationInterfaceProvider,
      useClass: AuthenticationService,
    },
    LocalStrategy,
    jwtStrategy,
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
