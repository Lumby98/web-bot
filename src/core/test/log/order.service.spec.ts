import { Connection, EntityManager, Repository } from 'typeorm';
import { OrderEntity } from '../../../infrastructure/entities/order.entity';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { OrderService } from '../../application.services/implementations/log/order.service';
import { orderEntityStub } from '../stubs/order-entity.stub';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateLogDto } from '../../../ui.api/dto/log/logEntry/create-log.dto';
import { CreateLogOrderDto } from '../../../ui.api/dto/log/order/create-log-order.dto';
import { OrderLogModel } from '../../models/logEntry/order-log.model';

jest.mock('src/infrastructure/api/puppeteer.utility.ts');

describe('OrderService', () => {
  let orderRepository: Repository<OrderEntity>;
  let orderService: OrderService;
  let entityManager;
  const mockEntityManager = () => ({
    create: jest.fn(),
    save: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: EntityManager,
          useFactory: mockEntityManager,
        },
        {
          provide: getRepositoryToken(OrderEntity),
          useClass: Repository,
        },
      ],
    }).compile();
    entityManager = await module.get<EntityManager>(EntityManager);
    orderService = await module.get<OrderService>(OrderService);
    orderRepository = await module.get<Repository<OrderEntity>>(
      getRepositoryToken(OrderEntity),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(orderService).toBeDefined();
  });

  describe('create', () => {
    describe('when called with a valid createLogDto', () => {
      let result;
      const expected: OrderLogModel = {
        orderNr: 'dfds',
        logs: [],
        id: 1,
        completed: false,
      };
      const orderEntity: OrderEntity = {
        orderNr: 'dfds',
        id: 1,
        completed: false,
        logs: [],
      };
      const createLogDto: CreateLogOrderDto = {
        orderNr: 'dfds',
        completed: false,
      };
      beforeEach(async () => {
        jest.spyOn(orderService, 'checkOrder').mockResolvedValueOnce(false);
        jest.spyOn(orderRepository, 'create').mockReturnValueOnce(orderEntity);
        jest.spyOn(orderRepository, 'save').mockResolvedValueOnce(orderEntity);
        result = await orderService.create(createLogDto);
      });

      it('should return the correct orderLogModel', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when called with a valid createLogDto but the order already exists', () => {
      let result;
      const orderEntity: OrderEntity = {
        orderNr: 'dfds',
        id: 1,
        completed: false,
        logs: [],
      };
      const createLogDto: CreateLogOrderDto = {
        orderNr: 'dfds',
        completed: false,
      };
      beforeEach(async () => {
        jest.spyOn(orderService, 'checkOrder').mockResolvedValueOnce(true);
        jest.spyOn(orderRepository, 'create').mockReturnValueOnce(orderEntity);
        jest.spyOn(orderRepository, 'save').mockResolvedValueOnce(orderEntity);
      });

      it('should throw the appropriate error', async () => {
        await expect(
          async () => await orderService.create(createLogDto),
        ).rejects.toThrow(
          'Cant create order, an order with this order number already exists',
        );
      });
    });
  });

  describe('createWithEntityManager', () => {
    describe('when called with a valid createLogDto', () => {
      let result;
      const expected: OrderLogModel = {
        orderNr: 'dfds',
        logs: [],
        id: 1,
        completed: false,
      };
      const orderEntity: OrderEntity = {
        orderNr: 'dfds',
        id: 1,
        completed: false,
        logs: [],
      };
      const createLogDto: CreateLogOrderDto = {
        orderNr: 'dfds',
        completed: false,
      };
      beforeEach(async () => {
        jest
          .spyOn(orderService, 'checkOrderWithEntityManager')
          .mockResolvedValueOnce(false);
        entityManager.create.mockResolvedValueOnce(orderEntity);
        entityManager.save.mockResolvedValueOnce(orderEntity);
        result = await orderService.createWithEntityManager(
          createLogDto,
          entityManager,
        );
      });

      it('should return the correct orderLogModel', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when called with a valid createLogDto but the order already exists', () => {
      let result;
      const orderEntity: OrderEntity = {
        orderNr: 'dfds',
        id: 1,
        completed: false,
        logs: [],
      };
      const createLogDto: CreateLogOrderDto = {
        orderNr: 'dfds',
        completed: false,
      };
      beforeEach(async () => {
        jest
          .spyOn(orderService, 'checkOrderWithEntityManager')
          .mockResolvedValueOnce(true);
        entityManager.create.mockResolvedValueOnce(orderEntity);
        entityManager.save.mockResolvedValueOnce(orderEntity);
      });

      it('should throw the appropriate error', async () => {
        await expect(
          async () =>
            await orderService.createWithEntityManager(
              createLogDto,
              entityManager,
            ),
        ).rejects.toThrow(
          'Cant create order, an order with this order number already exists',
        );
      });
    });
  });
});
