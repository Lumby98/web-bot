import { Connection, EntityManager, Repository } from 'typeorm';
import { OrderEntity } from '../../../infrastructure/entities/order.entity';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { OrderService } from '../../application.services/implementations/log/order.service';
import { orderEntityStub } from '../stubs/order-entity.stub';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateLogDto } from '../../../ui.api/dto/log/logEntry/create-log.dto';
import { CreateLogOrderDto } from '../../../ui.api/dto/log/order/create-log-order.dto';
import { OrderLogModel } from '../../models/logEntry/order-log.model';
import { ErrorEntity } from '../../../infrastructure/entities/error.entity';
import { LogErrorService } from '../../application.services/implementations/log/log-error.service';
import { CreateOrderErrorDto } from '../../../ui.api/dto/log/error/create-order-error.dto';
import { ErrorLogModel } from '../../models/logEntry/error-log.model';
import { paginationDtoErrorLogModelStub } from '../stubs/pagination-dto-error-log-model.stub';
import { QueryDto } from '../../../ui.api/dto/filter/query.dto';
import { errorEntityStub } from '../stubs/error-entity.stub';
import { UpdateOrderErrorDto } from '../../../ui.api/dto/log/error/update-order-error.dto';

jest.mock('src/infrastructure/api/puppeteer.utility.ts');

describe('LogErrorService', () => {
  let errorRepository;
  let errorService: LogErrorService;
  let entityManager;
  const mockEntityManager = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogErrorService,
        {
          provide: EntityManager,
          useFactory: mockEntityManager,
        },
        {
          provide: getRepositoryToken(ErrorEntity),
          useClass: Repository,
        },
      ],
    }).compile();
    entityManager = await module.get<EntityManager>(EntityManager);
    errorService = await module.get<LogErrorService>(LogErrorService);
    errorRepository = await module.get<Repository<ErrorEntity>>(
      getRepositoryToken(ErrorEntity),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(errorService).toBeDefined();
  });

  describe('create', () => {
    describe('when called with a valid createOrderErrorDto', () => {
      let result;
      const expected: ErrorLogModel = {
        id: 1,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const errorEntity: ErrorEntity = {
        id: 1,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const createOrderErrorDto: CreateOrderErrorDto = {
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      beforeEach(async () => {
        jest.spyOn(errorService, 'errorCheck').mockResolvedValueOnce(false);
        jest.spyOn(errorRepository, 'create').mockReturnValueOnce(errorEntity);
        jest.spyOn(errorRepository, 'save').mockResolvedValueOnce(errorEntity);
        result = await errorService.create(createOrderErrorDto);
      });

      it('should return the correct errorLogModel', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when called with a valid createOrderErrorDto but the error already exists', () => {
      let result;
      const errorEntity: ErrorEntity = {
        id: 1,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const createOrderErrorDto: CreateOrderErrorDto = {
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      beforeEach(async () => {
        jest.spyOn(errorService, 'errorCheck').mockResolvedValueOnce(true);
        jest.spyOn(errorRepository, 'create').mockReturnValueOnce(errorEntity);
        jest.spyOn(errorRepository, 'save').mockResolvedValueOnce(errorEntity);
      });

      it('should throw the appropriate error', async () => {
        await expect(
          async () => await errorService.create(createOrderErrorDto),
        ).rejects.toThrow(
          'Cant create error, an error with this error message already exists',
        );
      });
    });
  });

  describe('createWithEntityManager', () => {
    describe('when called with a valid createOrderErrorDto', () => {
      let result;
      const expected: ErrorLogModel = {
        id: 1,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const errorEntity: ErrorEntity = {
        id: 1,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const createOrderErrorDto: CreateOrderErrorDto = {
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      beforeEach(async () => {
        jest
          .spyOn(errorService, 'errorCheckWithEntityManager')
          .mockResolvedValueOnce(false);
        entityManager.create.mockResolvedValueOnce(errorEntity);
        entityManager.save.mockResolvedValueOnce(errorEntity);
        result = await errorService.createWithEntityManager(
          createOrderErrorDto,
          entityManager,
        );
      });

      it('should return the correct errorLogModel', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when called with a valid createOrderErrorDto and the error exists', () => {
      let result;
      const errorEntity: ErrorEntity = {
        id: 1,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const createOrderErrorDto: CreateOrderErrorDto = {
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      beforeEach(async () => {
        jest
          .spyOn(errorService, 'errorCheckWithEntityManager')
          .mockResolvedValueOnce(true);
        entityManager.create.mockResolvedValueOnce(errorEntity);
        entityManager.save.mockResolvedValueOnce(errorEntity);
      });

      it('should throw the appropriate error', async () => {
        await expect(
          async () =>
            await errorService.createWithEntityManager(
              createOrderErrorDto,
              entityManager,
            ),
        ).rejects.toThrow(
          'Cant create error, an error with this error message already exists',
        );
      });
    });
  });

  describe('errorCheck', () => {
    describe('when called with a valid errorString', () => {
      let result;
      const errorString = 'error';
      const errorEntity: ErrorEntity = {
        id: 1,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      beforeEach(async () => {
        jest
          .spyOn(errorRepository, 'findOne')
          .mockResolvedValueOnce(errorEntity);
        result = await errorService.errorCheck(errorString);
      });

      it('should return true', () => {
        expect(result).toEqual(true);
      });
    });

    describe('when called with a valid errorString and the error does not exists', () => {
      let result;
      const errorString = 'error';
      const errorEntity: ErrorEntity = {
        id: 1,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      beforeEach(async () => {
        jest.spyOn(errorRepository, 'findOne').mockResolvedValueOnce(undefined);
        result = await errorService.errorCheck(errorString);
      });

      it('should return true', () => {
        expect(result).toEqual(false);
      });
    });
  });

  describe('errorCheckWithEntityManager', () => {
    describe('when called with a valid errorString', () => {
      let result;
      const errorString = 'error';
      const errorEntity: ErrorEntity = {
        id: 1,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      beforeEach(async () => {
        entityManager.findOne.mockResolvedValueOnce(errorEntity);
        result = await errorService.errorCheckWithEntityManager(
          errorString,
          entityManager,
        );
      });

      it('should return true', () => {
        expect(result).toEqual(true);
      });
    });

    describe('when called with a valid errorString and the error does not exists', () => {
      let result;
      const errorString = 'error';
      const errorEntity: ErrorEntity = {
        id: 1,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      beforeEach(async () => {
        entityManager.findOne.mockResolvedValueOnce(undefined);
        result = await errorService.errorCheckWithEntityManager(
          errorString,
          entityManager,
        );
      });

      it('should return true', () => {
        expect(result).toEqual(false);
      });
    });
  });

  describe('findAll', () => {
    describe('when called with a valid QueryDto', () => {
      let result;
      const expected = paginationDtoErrorLogModelStub();
      const query: QueryDto = { take: 10, page: 2, keyword: 'eff' };
      const createOrderErrorDto: CreateOrderErrorDto = {
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const errorArray: ErrorEntity[] = [
        errorEntityStub(),
        errorEntityStub(),
        errorEntityStub(),
        errorEntityStub(),
        errorEntityStub(),
      ];
      beforeEach(async () => {
        jest
          .spyOn(errorRepository, 'findAndCount')
          .mockResolvedValueOnce([errorArray, 5]);
        result = await errorService.findAll(query);
      });

      it('should return the correct paginationDto', () => {
        expect(result).toEqual(expected);
      });
    });
  });

  describe('findByMessage', () => {
    describe('when called with a valid message', () => {
      let result;
      const expected = errorEntityStub();
      const message = 'test';

      beforeEach(async () => {
        jest.spyOn(errorRepository, 'findOne').mockResolvedValueOnce(expected);
        result = await errorService.findByMessage(message);
      });

      it('should return the correct error entity', () => {
        expect(result).toEqual(expected);
      });
    });
  });

  describe('findByMessageWithEntityManager', () => {
    describe('when called with a valid message', () => {
      let result;
      const expected = errorEntityStub();
      const message = 'test';

      beforeEach(async () => {
        entityManager.findOne.mockResolvedValueOnce(expected);
        result = await errorService.findByMessageWithEntityManager(
          message,
          entityManager,
        );
      });

      it('should return the correct error entity', () => {
        expect(result).toEqual(expected);
      });
    });
  });

  describe('findOne', () => {
    describe('when called with a valid id', () => {
      let result;
      const expected = errorEntityStub();
      const message = 'test';

      beforeEach(async () => {
        jest.spyOn(errorRepository, 'findOne').mockResolvedValueOnce(expected);
        result = await errorService.findOne(1);
      });

      it('should return the correct error entity', () => {
        expect(result).toEqual(expected);
      });
    });
  });

  describe('remove', () => {
    describe('when called with a valid id', () => {
      let result;
      const expected = errorEntityStub();
      const message = 'test';

      beforeEach(async () => {
        jest.spyOn(errorService, 'findOne').mockResolvedValueOnce(expected);
        jest.spyOn(errorRepository, 'delete').mockResolvedValueOnce(expected);
        result = await errorService.remove(1);
      });

      it('should return the correct error entity', () => {
        expect(result).toEqual(expected);
      });
    });
  });

  describe('removeAll', () => {
    describe('when called', () => {
      beforeEach(async () => {
        jest.spyOn(errorRepository, 'clear').mockResolvedValueOnce(undefined);
        await errorService.removeAll();
      });

      it('should call orderRepo clear ', () => {
        expect(errorRepository.clear).toBeCalled();
      });
    });
  });

  describe('update', () => {
    describe('when called with a valid createOrderErrorDto', () => {
      let result;
      const id = 1;
      const expected: ErrorLogModel = {
        id: 1,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const errorEntity: ErrorEntity = {
        id: id,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const updateErrorDto: UpdateOrderErrorDto = {
        id: id,
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      beforeEach(async () => {
        jest.spyOn(errorService, 'errorCheck').mockResolvedValueOnce(true);
        jest
          .spyOn(errorService, 'findByMessage')
          .mockResolvedValueOnce(errorEntity);
        jest.spyOn(errorService, 'findOne').mockResolvedValueOnce(expected);
        jest.spyOn(errorRepository, 'update').mockResolvedValueOnce(undefined);
        result = await errorService.update(id, updateErrorDto);
      });

      it('should return the correct errorLogModel', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when called with a valid createOrderErrorDto but the error does not exist', () => {
      let result;
      const id = 1;
      const expected: ErrorLogModel = {
        id: 1,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const errorEntity: ErrorEntity = {
        id: id,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const updateErrorDto: UpdateOrderErrorDto = {
        id: id,
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      beforeEach(async () => {
        jest.spyOn(errorService, 'errorCheck').mockResolvedValueOnce(false);
        jest
          .spyOn(errorService, 'findByMessage')
          .mockResolvedValueOnce(errorEntity);
        jest.spyOn(errorService, 'findOne').mockResolvedValueOnce(expected);
        jest.spyOn(errorRepository, 'update').mockResolvedValueOnce(undefined);
      });

      it('should throw the appropriate error', async () => {
        await expect(
          async () => await errorService.update(id, updateErrorDto),
        ).rejects.toThrow('This error does not exist');
      });
    });

    describe('when called with a valid createOrderErrorDto but the id doest match', () => {
      let result;
      const id = 1;
      const expected: ErrorLogModel = {
        id: 1,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const errorEntity: ErrorEntity = {
        id: id,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const updateErrorDto: UpdateOrderErrorDto = {
        id: 2,
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      beforeEach(async () => {
        jest.spyOn(errorService, 'errorCheck').mockResolvedValueOnce(true);
        jest
          .spyOn(errorService, 'findByMessage')
          .mockResolvedValueOnce(errorEntity);
        jest.spyOn(errorService, 'findOne').mockResolvedValueOnce(expected);
        jest.spyOn(errorRepository, 'update').mockResolvedValueOnce(undefined);
      });

      it('should throw the appropriate error', async () => {
        await expect(
          async () => await errorService.update(id, updateErrorDto),
        ).rejects.toThrow(
          'Invalid arguments: Provided id and the id of the update dto do not match.',
        );
      });
    });

    describe('when called with a valid createOrderErrorDto but the errormessage has been changed', () => {
      let result;
      const id = 1;
      const expected: ErrorLogModel = {
        id: 1,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const errorEntity: ErrorEntity = {
        id: 3,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const updateErrorDto: UpdateOrderErrorDto = {
        id: id,
        errorMessage: 'changed message',
        displayErrorMessage: undefined,
      };
      beforeEach(async () => {
        jest.spyOn(errorService, 'errorCheck').mockResolvedValueOnce(true);
        jest
          .spyOn(errorService, 'findByMessage')
          .mockResolvedValueOnce(errorEntity);
        jest.spyOn(errorService, 'findOne').mockResolvedValueOnce(expected);
        jest.spyOn(errorRepository, 'update').mockResolvedValueOnce(undefined);
      });

      it('should throw the appropriate error', async () => {
        await expect(
          async () => await errorService.update(id, updateErrorDto),
        ).rejects.toThrow(
          'Tried changing error message: It is forbidden to change an errors message',
        );
      });
    });

    describe('when called with a valid createOrderErrorDto but the updated error is undefined', () => {
      let result;
      const id = 1;
      const expected: ErrorLogModel = {
        id: 1,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const errorEntity: ErrorEntity = {
        id: id,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const updateErrorDto: UpdateOrderErrorDto = {
        id: id,
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      beforeEach(async () => {
        jest.spyOn(errorService, 'errorCheck').mockResolvedValueOnce(true);
        jest
          .spyOn(errorService, 'findByMessage')
          .mockResolvedValueOnce(errorEntity);
        jest.spyOn(errorService, 'findOne').mockResolvedValueOnce(undefined);
        jest.spyOn(errorRepository, 'update').mockResolvedValueOnce(undefined);
      });

      it('should throw the appropriate error', async () => {
        await expect(
          async () => await errorService.update(id, updateErrorDto),
        ).rejects.toThrow('Failed to update error');
      });
    });

    describe('when called with a valid createOrderErrorDto but the updated error is didnt update correctly', () => {
      let result;
      const id = 1;
      const expected: ErrorLogModel = {
        id: 1,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };

      const wrongModel: ErrorLogModel = {
        id: 1,
        logs: [],
        errorMessage: 'bork',
        displayErrorMessage: undefined,
      };
      const errorEntity: ErrorEntity = {
        id: id,
        logs: [],
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      const updateErrorDto: UpdateOrderErrorDto = {
        id: id,
        errorMessage: 'testMessage',
        displayErrorMessage: undefined,
      };
      beforeEach(async () => {
        jest.spyOn(errorService, 'errorCheck').mockResolvedValueOnce(true);
        jest
          .spyOn(errorService, 'findByMessage')
          .mockResolvedValueOnce(errorEntity);
        jest.spyOn(errorService, 'findOne').mockResolvedValueOnce(wrongModel);
        jest.spyOn(errorRepository, 'update').mockResolvedValueOnce(undefined);
      });

      it('should throw the appropriate error', async () => {
        await expect(
          async () => await errorService.update(id, updateErrorDto),
        ).rejects.toThrow('Failed to update error');
      });
    });
  });
});
