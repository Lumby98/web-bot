import { LogService } from '../../application.services/implementations/log/log.service';
import { Connection, Repository } from 'typeorm';
import { LogEntity } from '../../../infrastructure/entities/log.entity';
import { OrderService } from '../../application.services/implementations/log/order.service';
import { LogErrorService } from '../../application.services/implementations/log/log-error.service';
import { OrderEntity } from '../../../infrastructure/entities/order.entity';
import { ErrorEntity } from '../../../infrastructure/entities/error.entity';
import { CreateLogDto } from '../../../ui.api/dto/log/logEntry/create-log.dto';
import { ProcessStepEnum } from '../../enums/processStep.enum';
import { LogModel } from '../../models/logEntry/log.model';
import { orderEntityStub } from '../stubs/order-entity.stub';
import { errorEntityStub } from '../stubs/error-entity.stub';
import { getRepositoryToken } from '@nestjs/typeorm';
import { orderInterfaceProvider } from '../../application.services/interfaces/log/order.interface';
import { logErrorInterfaceProvider } from '../../application.services/interfaces/log/log-error.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { orderLogStub } from '../stubs/order-log.stub';
import { errorLogStub } from '../stubs/error-log.stub';
import { QueryDto } from '../../../ui.api/dto/filter/query.dto';
import { logEntityStub } from '../stubs/log-entity.stub';
import { PaginationDto } from '../../../ui.api/dto/filter/pagination-dto';
import { logModelStub } from '../stubs/log-model.stub';
import { UpdateLogDto } from '../../../ui.api/dto/log/logEntry/update-log.dto';

describe('LogService', () => {
  let logService: LogService;
  let logRepo;
  let orderService: OrderService;
  let errorService: LogErrorService;
  const mockConnection = () => ({
    transaction: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogService,
        OrderService,
        LogErrorService,
        {
          provide: Connection,
          useFactory: mockConnection,
        },
        {
          provide: getRepositoryToken(LogEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(OrderEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ErrorEntity),
          useClass: Repository,
        },
        {
          provide: orderInterfaceProvider,
          useValue: {
            create: jest.fn().mockResolvedValue(orderLogStub()),
            findByOrderNumber: jest.fn().mockResolvedValue(orderEntityStub()),
            checkOrder: jest.fn().mockResolvedValue(true),
            update: jest.fn().mockResolvedValue(orderLogStub()),
          },
        },
        {
          provide: logErrorInterfaceProvider,
          useValue: {
            errorCheck: jest.fn().mockResolvedValue(true),
            create: jest.fn().mockResolvedValue(errorLogStub()),
            findByMessage: jest.fn().mockResolvedValue(errorEntityStub()),
            update: jest.fn().mockResolvedValue(errorLogStub()),
          },
        },
      ],
    }).compile();

    logService = await module.get(LogService);
    logRepo = await module.get(getRepositoryToken(LogEntity));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(logService).toBeDefined();
  });

  it('should be defined', () => {
    expect(OrderService).toBeDefined();
  });

  it('should be defined', () => {
    expect(LogErrorService).toBeDefined();
  });

  describe('create', () => {
    describe('when given valid data', () => {
      const date = new Date();
      const dto: CreateLogDto = {
        status: true,
        process: ProcessStepEnum.GETORDERINFO,
        timestamp: date,
        order: { orderNr: '123', completed: true },
        error: { errorMessage: 'test', displayErrorMessage: undefined },
      };
      const expected: LogModel = {
        status: true,
        process: ProcessStepEnum.GETORDERINFO,
        timestamp: date,
        order: { orderNr: '123', completed: true, id: 1, logs: [] },
        error: {
          errorMessage: 'test',
          displayErrorMessage: undefined,
          id: 1,
          logs: [],
        },
        id: 1,
      };
      let result;
      beforeEach(async () => {
        jest.spyOn(logRepo, 'create').mockResolvedValueOnce(() => {
          return {};
        });
        jest.spyOn(logRepo, 'save').mockResolvedValueOnce(expected);
        result = await logService.create(dto);
      });

      it('should return logModel', () => {
        expected.timestamp = result.timestamp;
        expect(result).toEqual(expected);
      });
    });
  });

  describe('findAll', () => {
    describe('return list of logs', () => {
      const dto: QueryDto = {
        keyword: '',
        page: 1,
        take: 5,
      };
      let result;
      const log = logModelStub();
      log.error.displayErrorMessage = undefined;
      const ex: PaginationDto<LogModel> = {
        count: 1,
        data: [log],
      };
      beforeEach(async () => {
        jest.spyOn(logRepo, 'findAndCount').mockResolvedValueOnce([[log], 1]);
        result = await logService.findAll(dto);
        ex.data[0].timestamp = result.data[0].timestamp;
      });
      it('should return an array of logs', () => {
        expect(result).toEqual(ex);
      });
    });
  });

  describe('findOne', () => {
    describe('when given valid id', () => {
      let result;
      const stub = logEntityStub();
      beforeEach(async () => {
        jest.spyOn(logRepo, 'findOne').mockResolvedValueOnce(stub);
        result = await logService.findOne(stub.id);
        stub.timestamp = result.timestamp;
      });

      it('should should return logModel', () => {
        expect(result).toEqual(stub);
      });
    });
  });

  describe('delete', () => {
    describe('should delete', () => {
      let result;
      const stub = logModelStub();
      beforeEach(async () => {
        jest.spyOn(logRepo, 'findOne').mockResolvedValueOnce(stub);
        jest.spyOn(logRepo, 'delete').mockResolvedValueOnce(stub);
        result = await logService.remove(stub.id);
        stub.timestamp = result.timestamp;
      });

      it('should delete and return log', () => {
        expect(result).toEqual(stub);
      });
    });
  });

  describe('update', () => {
    describe('when updating', () => {
      let result;
      const stub = logModelStub();
      stub.status = false;
      const update: UpdateLogDto = {
        id: stub.id,
        order: stub.order,
        error: stub.error,
        timestamp: stub.timestamp,
        process: stub.process,
        status: true,
      };

      beforeEach(async () => {
        jest.spyOn(logRepo, 'findOne').mockResolvedValueOnce(stub);
        jest.spyOn(logRepo, 'save').mockResolvedValueOnce(update);
        result = await logService.update(update);
        update.timestamp = result.timestamp;
      });

      it('should return an updated log', () => {
        expect(result).toEqual(update);
      });
    });
  });
});
