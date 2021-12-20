import { Test, TestingModule } from '@nestjs/testing';
import { LogService } from '../../application.services/implementations/log/log.service';
import { getConnectionToken, getRepositoryToken } from '@nestjs/typeorm';
import { HultaforsProduct } from '../../../infrastructure/entities/hultafors.product.entity';
import { Connection, Repository } from 'typeorm';
import { LogEntity } from '../../../infrastructure/entities/log.entity';
import { orderInterfaceProvider } from '../../application.services/interfaces/log/order.interface';
import { OrderService } from '../../application.services/implementations/log/order.service';
import { logErrorInterfaceProvider } from '../../application.services/interfaces/log/log-error.interface';
import { LogErrorService } from '../../application.services/implementations/log/log-error.service';
import { logInterfaceProvider } from '../../application.services/interfaces/log/log.interface';
import { OrderEntity } from '../../../infrastructure/entities/order.entity';
import { ErrorEntity } from '../../../infrastructure/entities/error.entity';

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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(logService).toBeDefined();
  });
});
