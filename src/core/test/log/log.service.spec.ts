import { Test, TestingModule } from '@nestjs/testing';
import { LogService } from '../../application.services/implementations/log/log.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { LogEntity } from '../../../infrastructure/entities/log.entity';
import { orderInterfaceProvider } from '../../application.services/interfaces/log/order.interface';
import { OrderService } from '../../application.services/implementations/log/order.service';
import { logErrorInterfaceProvider } from '../../application.services/interfaces/log/log-error.interface';
import { LogErrorService } from '../../application.services/implementations/log/log-error.service';
import { OrderEntity } from '../../../infrastructure/entities/order.entity';
import { ErrorEntity } from '../../../infrastructure/entities/error.entity';
import { CreateLogDto } from '../../../ui.api/dto/log/logEntry/create-log.dto';
import { ProcessStepEnum } from '../../enums/processStep.enum';
import { LogModel } from '../../models/logEntry/log.model';

describe('LogService', () => {
  let logService: LogService;
  let connection;
  const mockConnection = () => ({
    transaction: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogService,
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
        { provide: orderInterfaceProvider, useClass: OrderService },
        { provide: logErrorInterfaceProvider, useClass: LogErrorService },
      ],
    }).compile();

    logService = await module.get<LogService>(LogService);
    connection = await module.get<Connection>(Connection);
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
      const dto: CreateLogDto = {
        status: true,
        process: ProcessStepEnum.GETORDERINFO,
        timestamp: new Date(),
        order: { orderNr: '123', completed: true },
        error: { errorMessage: 'test' },
      };
      const expected: LogModel = {
        status: true,
        process: ProcessStepEnum.GETORDERINFO,
        timestamp: new Date(),
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
        result = await logService.create(dto);
      });

      it('should return logModel', () => {
        expect(result).toEqual(expected);
      });
    });
  });
});
