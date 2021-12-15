import { Test, TestingModule } from '@nestjs/testing';
import { InsoleService } from '../service/insole.service';
import { AuthenticationModule } from '../../ui.api/modules/authentication.module';
import { Connection, Repository } from 'typeorm';
import { getConnectionToken, getRepositoryToken } from '@nestjs/typeorm';
import { LogEntity } from '../../infrastructure/entities/log.entity';
import { SavedLogin } from '../../infrastructure/entities/Savedlogin.entity';
import { savedLoginServiceInterfaceProvider } from '../interfaces/savedLoginService.interface';
import { SavedLoginService } from '../service/SavedLogin.service';
import { Key } from '../../infrastructure/entities/key';
import { authenticationInterfaceProvider } from '../interfaces/authentication.interface';
import { AuthenticationService } from '../service/authentication.service';
import { userInterfaceProvider } from '../interfaces/user.interface';
import { UserService } from '../service/user.service';
import { User } from '../../infrastructure/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('InsoleService', () => {
  let service: InsoleService;
  const mockConnection = () => ({
    transaction: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsoleService,
        {
          provide: Connection,
          useFactory: mockConnection,
        },
        {
          provide: getRepositoryToken(SavedLogin),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Key),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: savedLoginServiceInterfaceProvider,
          useClass: SavedLoginService,
        },
        {
          provide: authenticationInterfaceProvider,
          useClass: AuthenticationService,
        },
        { provide: userInterfaceProvider, useClass: UserService },
      ],
      imports: [
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
    }).compile();

    service = module.get<InsoleService>(InsoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
