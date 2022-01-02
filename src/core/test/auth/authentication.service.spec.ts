import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from '../../application.services/implementations/auth/authentication.service';
import { userInterfaceProvider } from '../../application.services/interfaces/auth/user.interface';
import { UserService } from '../../application.services/implementations/auth/user.service';
import { jwtStrategy } from '../../strategy/jwt.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../infrastructure/entities/user.entity';
import { Repository } from 'typeorm';
import { SavedLogin } from '../../../infrastructure/entities/Savedlogin.entity';
import { LoginTypeEnum } from '../../enums/loginType.enum';
import { SavedLoginDto } from '../../../ui.api/dto/savedLogin/SavedLoginDto';
import { RegisterDto } from '../../../ui.api/dto/authentication/register.dto';
import { UserModel } from '../../models/user.model';
import { CreateUserDto } from '../../../ui.api/dto/user/create-user.dto';
import * as bcrypt from 'bcrypt';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let config: ConfigService;
  let jwtService;

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
        {
          provide: userInterfaceProvider,
          useValue: {
            create: jest.fn((userDto: CreateUserDto): UserModel => {
              return {
                id: 1,
                username: 'testUsername',
                password: 'testPassword',
                admin: 1,
              };
            }),
            getByUsername: jest.fn((username: string): UserModel => {
              return {
                id: 1,
                username: 'testUsername',
                password: 'testPassword',
                admin: 1,
              };
            }),
          },
        },
        jwtStrategy,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();
    config = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    describe('when it gets valid arguments', () => {
      let result;
      const key =
        '$2b$10$TY.PRWKxTZyuzvNeg.7tE.C2fEIeoAndaxO5agnSJbv4d.EEr3aFm';

      const testRegisterDto: RegisterDto = {
        username: 'testUsername',
        password: 'testPassword',
        admin: 1,
      };

      const userModel: UserModel = {
        id: 1,
        username: 'testUsername',
        password: 'testPassword',
        admin: 1,
      };
      beforeEach(async () => {
        result = await service.register(testRegisterDto);
      });

      it('Should return the right object', async () => {
        expect(result.username).toEqual(testRegisterDto.username);
      });
    });
  });

  describe('getAuthenticatedUser', () => {
    describe('when it gets valid arguments', () => {
      let result;
      const password = 'password';
      const userName = 'username';

      const testRegisterDto: RegisterDto = {
        username: 'testUsername',
        password: 'testPassword',
        admin: 1,
      };

      const userModel: UserModel = {
        id: 1,
        username: 'testUsername',
        password: 'testPassword',
        admin: 1,
      };
      beforeEach(async () => {
        jest.spyOn(service, 'verifyPassword').mockResolvedValueOnce(undefined);
        result = await service.getAuthenticatedUser(userName, password);
      });

      it('Should return the right object', async () => {
        expect(result).toEqual(userModel);
      });
    });
  });

  describe('verifyPassword', () => {
    describe('when it gets valid arguments', () => {
      let result;
      const password = 'admin';
      const hashedPassword =
        '$2b$10$TY.PRWKxTZyuzvNeg.7tE.C2fEIeoAndaxO5agnSJbv4d.EEr3aFm';

      beforeEach(async () => {
        await service.verifyPassword(password, hashedPassword);
      });
      it('should not throw an error', async () => {
        await service.verifyPassword(password, hashedPassword);
      });
    });
  });

  describe('getCookieWithJwtToken', () => {
    describe('when it gets valid arguments', () => {
      let result;
      const token = 'token';

      beforeEach(async () => {
        jest.spyOn(jwtService, 'sign').mockReturnValueOnce(token);
        result = service.getCookieWithJwtToken(1);
      });
      it('should return the cookie', async () => {
        expect(result).toEqual(
          `Authentication=${token}; HttpOnly; Path=/; Max-Age=400;`,
        );
      });
    });
  });

  describe('getCookieForLogOut', () => {
    describe('when it gets valid arguments', () => {
      let result;

      beforeEach(async () => {
        result = service.getCookieForLogOut();
      });
      it('should return the cookie', async () => {
        expect(result).toEqual(`Authentication=; HttpOnly; Path=/; Max-Age=0;`);
      });
    });
  });
});
