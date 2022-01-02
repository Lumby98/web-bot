import { SavedLoginService } from '../../application.services/implementations/auth/SavedLogin.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Key } from '../../../infrastructure/entities/key';
import { SavedLogin } from '../../../infrastructure/entities/Savedlogin.entity';
import { authenticationInterfaceProvider } from '../../application.services/interfaces/auth/authentication.interface';
import { AuthenticationService } from '../../application.services/implementations/auth/authentication.service';
import { userInterfaceProvider } from '../../application.services/interfaces/auth/user.interface';
import { UserService } from '../../application.services/implementations/auth/user.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtStrategy } from '../../strategy/jwt.strategy';
import { User } from '../../../infrastructure/entities/user.entity';
import { InsertSavedLoginDto } from '../../../ui.api/dto/savedLogin/insert-SavedLogin.dto';
import { LoginTypeEnum } from '../../enums/loginType.enum';
import { InsertKeyDto } from '../../../ui.api/dto/savedLogin/insert-Key.dto';
import { SavedLoginModel } from '../../models/Savedlogin.model';
import { SavedLoginDto } from '../../../ui.api/dto/savedLogin/SavedLoginDto';

describe('SavedLoginService', () => {
  let savedLoginService: SavedLoginService;
  let authenticationService: AuthenticationService;
  let savedLoginRepository: Repository<SavedLogin>;
  let keyRepository: Repository<Key>;
  let connection;
  const mockConnection = () => ({
    transaction: jest.fn(),
  });

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
        SavedLoginService,
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
        jwtStrategy,
        {
          provide: Connection,
          useFactory: mockConnection,
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
          provide: getRepositoryToken(SavedLogin),
          useClass: Repository,
        },
        {
          provide: authenticationInterfaceProvider,
          useValue: {
            verifyPassword: jest.fn(
              (plainTextPassword: string, hashedPassword: string) => {
                return undefined;
              },
            ),
          },
        },
        {
          provide: userInterfaceProvider,
          useClass: UserService,
        },
      ],
    }).compile();

    savedLoginService = await module.get<SavedLoginService>(SavedLoginService);

    savedLoginRepository = await module.get(getRepositoryToken(SavedLogin));
    keyRepository = await module.get(getRepositoryToken(Key));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(savedLoginService).toBeDefined();
  });

  describe('insertLogin', () => {
    describe('When insertLogin gets the correct values prevlogin is undefined', () => {
      it('Should insert a new login', async () => {
        const testInsertSavedLoginDto: InsertSavedLoginDto = {
          username: 'test',
          password: 'test',
          loginType: LoginTypeEnum.NESKRID,
          key: 'key',
        };

        const testsavedLogin: SavedLogin = {
          id: 1,
          username: 'test',
          password: 'test',
          loginType: LoginTypeEnum.NESKRID,
          iv: '123123123',
          salt: 'fesfsefsef',
        };

        jest
          .spyOn(savedLoginRepository, 'findOne')
          .mockImplementationOnce(() => {
            return undefined;
          });

        jest
          .spyOn(keyRepository, 'findOne')
          .mockResolvedValueOnce({ id: 1, password: 'stuff' });

        jest
          .spyOn(savedLoginRepository, 'remove')
          .mockResolvedValueOnce(testsavedLogin);

        jest
          .spyOn(savedLoginRepository, 'create')
          .mockReturnValueOnce(testsavedLogin);

        jest
          .spyOn(savedLoginRepository, 'save')
          .mockResolvedValueOnce(testsavedLogin);

        const expected = await savedLoginService.insertLogin(
          testInsertSavedLoginDto,
        );

        expect(expected).toEqual(testsavedLogin);
      });
    });

    describe('When insertLogin gets the correct values prevlogin is defined', () => {
      it('Should insert a new login', async () => {
        const testInsertSavedLoginDto: InsertSavedLoginDto = {
          username: 'test',
          password: 'test',
          loginType: LoginTypeEnum.NESKRID,
          key: 'key',
        };

        const testsavedLogin: SavedLogin = {
          id: 1,
          username: 'test',
          password: 'test',
          loginType: LoginTypeEnum.NESKRID,
          iv: '123123123',
          salt: 'fesfsefsef',
        };

        jest
          .spyOn(savedLoginRepository, 'findOne')
          .mockResolvedValueOnce(testsavedLogin);

        jest
          .spyOn(keyRepository, 'findOne')
          .mockResolvedValueOnce({ id: 1, password: 'stuff' });

        jest
          .spyOn(savedLoginRepository, 'remove')
          .mockResolvedValueOnce(testsavedLogin);

        jest
          .spyOn(savedLoginRepository, 'create')
          .mockReturnValueOnce(testsavedLogin);

        jest
          .spyOn(savedLoginRepository, 'save')
          .mockResolvedValueOnce(testsavedLogin);

        const expected = await savedLoginService.insertLogin(
          testInsertSavedLoginDto,
        );

        expect(expected).toEqual(testsavedLogin);
      });

      it('Should call remove with right login', async () => {
        const testInsertSavedLoginDto: InsertSavedLoginDto = {
          username: 'test',
          password: 'test',
          loginType: LoginTypeEnum.NESKRID,
          key: 'key',
        };

        const testsavedLogin: SavedLogin = {
          id: 1,
          username: 'test',
          password: 'test',
          loginType: LoginTypeEnum.NESKRID,
          iv: '123123123',
          salt: 'fesfsefsef',
        };

        jest
          .spyOn(savedLoginRepository, 'findOne')
          .mockResolvedValueOnce(testsavedLogin);

        jest
          .spyOn(keyRepository, 'findOne')
          .mockResolvedValueOnce({ id: 1, password: 'stuff' });

        jest
          .spyOn(savedLoginRepository, 'remove')
          .mockResolvedValueOnce(testsavedLogin);

        jest
          .spyOn(savedLoginRepository, 'create')
          .mockReturnValueOnce(testsavedLogin);

        jest
          .spyOn(savedLoginRepository, 'save')
          .mockResolvedValueOnce(testsavedLogin);

        const expected = await savedLoginService.insertLogin(
          testInsertSavedLoginDto,
        );

        expect(savedLoginRepository.remove).toBeCalledWith(testsavedLogin);
      });
    });
  });

  describe('verifyKey', () => {
    describe('when it gets a key', () => {
      it('Should not throw an error ', async () => {
        jest
          .spyOn(keyRepository, 'findOne')
          .mockResolvedValueOnce({ id: 1, password: 'stuff' });

        await expect(async () => {
          await savedLoginService.verifyKey('keyTes');
        }).not.toThrowError();
      });
    });

    describe('when it cant get the key', () => {
      it('Should throw an Wrong credentials provided', async () => {
        jest.spyOn(keyRepository, 'findOne').mockResolvedValueOnce(undefined);

        await expect(async () => {
          await savedLoginService.verifyKey('keyTes');
        }).rejects.toThrowError('Wrong credentials provided');
      });
    });
  });

  describe('changeKey', () => {
    describe('when it gets a key', () => {
      const testsavedLogin: SavedLogin = {
        id: 1,
        username: 'test',
        password: 'test',
        loginType: LoginTypeEnum.NESKRID,
        iv: '123123123',
        salt: 'fesfsefsef',
      };

      const testInsertKey: InsertKeyDto = {
        password: 'testPassword',
        prevPassword: 'TestPrevPassword',
      };

      const insertDTO: InsertSavedLoginDto = {
        username: 'testUserName',
        password: 'test',
        loginType: 0,
        key: 'testPassword',
      };

      const insertDTO2: InsertSavedLoginDto = {
        username: 'testUserName',
        password: 'test',
        loginType: 1,
        key: 'testPassword',
      };
      beforeEach(async () => {
        jest
          .spyOn(keyRepository, 'findOne')
          .mockResolvedValueOnce({ id: 1, password: 'stuff' });

        jest.spyOn(savedLoginService, 'findAllLogins').mockResolvedValueOnce([
          {
            id: 1,
            password: 'test',
            loginType: LoginTypeEnum.ORTOWEAR,
            username: 'testUserName',
          },
          {
            id: 2,
            password: 'test',
            loginType: LoginTypeEnum.NESKRID,
            username: 'testUserName',
          },
        ]);

        jest.spyOn(keyRepository, 'update').mockResolvedValueOnce(null);

        jest
          .spyOn(savedLoginService, 'getKey')
          .mockResolvedValueOnce(undefined);

        jest
          .spyOn(savedLoginService, 'insertLogin')
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined);

        await savedLoginService.changeKey(testInsertKey);
      });

      it('Should call insert login ', async () => {
        expect(savedLoginService.insertLogin).toBeCalledTimes(2);
      });

      it('Should call insert login with the right arguments', async () => {
        expect(savedLoginService.insertLogin).toBeCalledWith(insertDTO);
        expect(savedLoginService.insertLogin).toBeCalledWith(insertDTO2);
      });
    });

    describe('when it cant get the key', () => {
      const testInsertKey: InsertKeyDto = {
        password: 'testPassword',
        prevPassword: 'TestPrevPassword',
      };
      beforeEach(async () => {
        jest.spyOn(keyRepository, 'findOne').mockResolvedValueOnce(undefined);

        jest.spyOn(savedLoginService, 'findAllLogins').mockResolvedValueOnce([
          {
            id: 1,
            password: 'test',
            loginType: LoginTypeEnum.ORTOWEAR,
            username: 'testUserName',
          },
          {
            id: 2,
            password: 'test',
            loginType: LoginTypeEnum.NESKRID,
            username: 'testUserName',
          },
        ]);
      });
      it('Should throw a could not get key error', async () => {
        await expect(async () => {
          await savedLoginService.changeKey(testInsertKey);
        }).rejects.toThrowError('Could not get key');
      });
    });
  });

  describe('getKey', () => {
    describe('when it gets a key', () => {
      let result;
      const expected = { id: 1, password: 'stuff' };
      beforeEach(async () => {
        jest.spyOn(keyRepository, 'findOne').mockResolvedValueOnce(expected);

        result = await savedLoginService.getKey();
      });

      it('Should return the right key', async () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when it cant get the key', () => {
      beforeEach(async () => {
        jest.spyOn(keyRepository, 'findOne').mockResolvedValueOnce(undefined);

        jest.spyOn(savedLoginService, 'findAllLogins').mockResolvedValueOnce([
          {
            id: 1,
            password: 'test',
            loginType: LoginTypeEnum.ORTOWEAR,
            username: 'testUserName',
          },
          {
            id: 2,
            password: 'test',
            loginType: LoginTypeEnum.NESKRID,
            username: 'testUserName',
          },
        ]);
      });
      it('Should throw a could not get key error', async () => {
        await expect(async () => {
          await savedLoginService.getKey();
        }).rejects.toThrowError('Could not get key');
      });
    });
  });

  describe('encryptLogin', () => {
    describe('when it gets a insertSavedLoginDTO', () => {
      let result;
      const insertDTO2: InsertSavedLoginDto = {
        username: 'testUserName',
        password: 'test',
        loginType: 1,
        key: 'testPassword',
      };
      beforeEach(async () => {
        result = await savedLoginService.encryptLogin(insertDTO2);
      });

      it('Should return the right object', async () => {
        expect(result.loginType).toEqual(insertDTO2.loginType);
      });
    });
  });

  describe('decryptLogin', () => {
    describe('when it gets valid arguments', () => {
      let result;
      const savedLoginModel: SavedLoginModel = {
        id: 2,
        iv: '77In1+Hh+cCjQ++cD9OOVw==',
        salt: 'jjGI8fo7/fO9BQErvwaJ0Q==',
        username: 'kH44iJhqK0medXVdm7XjROn+',
        password: 'jXAljpFFNFE=',
        loginType: 1,
      };
      beforeEach(async () => {
        result = await savedLoginService.decryptLogin(
          savedLoginModel,
          '$2b$10$TY.PRWKxTZyuzvNeg.7tE.C2fEIeoAndaxO5agnSJbv4d.EEr3aFm',
        );
      });

      it('Should return the right object', async () => {
        expect(result.loginType).toEqual(savedLoginModel.loginType);
      });
    });
  });

  describe('getLogin', () => {
    describe('when it gets valid arguments', () => {
      let result;
      const loginType = LoginTypeEnum.NESKRID;
      const key =
        '$2b$10$TY.PRWKxTZyuzvNeg.7tE.C2fEIeoAndaxO5agnSJbv4d.EEr3aFm';

      const savedLoginModel: SavedLoginModel = {
        id: 2,
        iv: '77In1+Hh+cCjQ++cD9OOVw==',
        salt: 'jjGI8fo7/fO9BQErvwaJ0Q==',
        username: 'kH44iJhqK0medXVdm7XjROn+',
        password: 'jXAljpFFNFE=',
        loginType: 1,
      };

      const testsavedLogin: SavedLogin = {
        id: 1,
        username: 'test',
        password: 'test',
        loginType: LoginTypeEnum.NESKRID,
        iv: '123123123',
        salt: 'fesfsefsef',
      };

      const saveLoginDTO: SavedLoginDto = {
        id: 1,
        loginType: LoginTypeEnum.NESKRID,
        username: 'uff',
        password: 'fff',
      };
      beforeEach(async () => {
        jest
          .spyOn(savedLoginRepository, 'findOne')
          .mockResolvedValueOnce(testsavedLogin);

        jest
          .spyOn(savedLoginService, 'decryptLogin')
          .mockResolvedValueOnce(saveLoginDTO);
        result = await savedLoginService.getLogin(loginType, key);
      });

      it('Should return the right object', async () => {
        expect(result.loginType).toEqual(savedLoginModel.loginType);
      });
    });
  });

  describe('findAllLogins', () => {
    describe('when it gets valid arguments', () => {
      let result;
      const key =
        '$2b$10$TY.PRWKxTZyuzvNeg.7tE.C2fEIeoAndaxO5agnSJbv4d.EEr3aFm';

      const testsavedLogins: SavedLogin[] = [
        {
          id: 1,
          username: 'test',
          password: 'test',
          loginType: LoginTypeEnum.NESKRID,
          iv: '123123123',
          salt: 'fesfsefsef',
        },
        {
          id: 2,
          username: 'test',
          password: 'test',
          loginType: LoginTypeEnum.NESKRID,
          iv: '123123123',
          salt: 'fesfsefsef',
        },
      ];

      const saveLoginDTOs: SavedLoginDto[] = [
        {
          id: 1,
          loginType: LoginTypeEnum.NESKRID,
          username: 'uff',
          password: 'fff',
        },
        {
          id: 1,
          loginType: LoginTypeEnum.NESKRID,
          username: 'uff',
          password: 'fff',
        },
      ];
      beforeEach(async () => {
        jest
          .spyOn(savedLoginRepository, 'find')
          .mockResolvedValueOnce(testsavedLogins);

        jest
          .spyOn(savedLoginService, 'verifyKey')
          .mockResolvedValueOnce(undefined);

        jest
          .spyOn(savedLoginService, 'decryptLogin')
          .mockResolvedValueOnce({
            id: 1,
            loginType: LoginTypeEnum.NESKRID,
            username: 'uff',
            password: 'fff',
          })
          .mockResolvedValueOnce({
            id: 1,
            loginType: LoginTypeEnum.NESKRID,
            username: 'uff',
            password: 'fff',
          });
        result = await savedLoginService.findAllLogins(key);
      });

      it('Should return the right object', async () => {
        expect(result).toEqual(saveLoginDTOs);
      });
    });
  });
});
