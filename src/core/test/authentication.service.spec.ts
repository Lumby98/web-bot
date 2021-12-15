import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from '../application.services/implementations/auth/authentication.service';
import { userInterfaceProvider } from '../application.services/interfaces/auth/user.interface';
import { UserService } from '../application.services/implementations/auth/user.service';
import { jwtStrategy } from '../strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../infrastructure/entities/user.entity';
import { Repository } from 'typeorm';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let config: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
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
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') {
                return 'secret';
              } else if (key === 'JWT_EXPIRATION_TIME') {
                return 400;
              }
              return null;
            }),
          },
        },
        AuthenticationService,
        { provide: userInterfaceProvider, useClass: UserService },
        jwtStrategy,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
