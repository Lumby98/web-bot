import { Connection, EntityManager, Repository } from 'typeorm';
import { OrderEntity } from '../../../infrastructure/entities/order.entity';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { OrderService } from '../../application.services/implementations/log/order.service';
import { orderEntityStub } from '../stubs/order-entity.stub';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateLogOrderDto } from '../../../ui.api/dto/log/order/create-log-order.dto';
import { OrderLogModel } from '../../models/logEntry/order-log.model';
import { QueryDto } from '../../../ui.api/dto/filter/query.dto';
import { PaginationDto } from '../../../ui.api/dto/filter/pagination-dto';

jest.mock('src/infrastructure/api/puppeteer.utility.ts');

describe('OrderService', () => {
  let orderRepository;
  let orderService: OrderService;
  let entityManager;
  const mockEntityManager = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
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

  describe('checkOrder', () => {
    describe('when called with a valid orderNumber and the order exists', () => {
      let result;
      const orderNumber = 'dfds';
      const orderEntity: OrderEntity = {
        orderNr: 'dfds',
        id: 1,
        completed: false,
        logs: [],
      };
      beforeEach(async () => {
        jest
          .spyOn(orderRepository, 'findOne')
          .mockResolvedValueOnce(orderEntity);
        result = await orderService.checkOrder(orderNumber);
      });

      it('should return the correct orderLogModel', () => {
        expect(result).toEqual(true);
      });
    });

    describe('when called with a valid orderNumber and the order does not exist', () => {
      let result;
      const orderNumber = 'dfds';
      const orderEntity: OrderEntity = {
        orderNr: 'dfds',
        id: 1,
        completed: false,
        logs: [],
      };
      beforeEach(async () => {
        jest
          .spyOn(orderRepository, 'findOne')
          .mockResolvedValueOnce(orderEntity);
        result = await orderService.checkOrder(orderNumber);
      });

      it('should return the correct orderLogModel', () => {
        expect(result).toEqual(true);
      });
    });
  });

  describe('checkOrderWithEntityManager', () => {
    describe('when order exist', () => {
      let result;
      beforeEach(async () => {
        entityManager.findOne.mockResolvedValueOnce(orderEntityStub());
        result = await orderService.checkOrderWithEntityManager(
          'test',
          entityManager,
        );

        it('should return true', () => {
          expect(result).toEqual(true);
        });
      });
    });

    describe('when order does not exist', () => {
      let result;
      beforeEach(async () => {
        entityManager.findOne.mockResolvedValueOnce(undefined);
        result = await orderService.checkOrderWithEntityManager(
          'test',
          entityManager,
        );

        it('should return false', () => {
          expect(result).toEqual(false);
        });
      });
    });
  });

  describe('findAll', () => {
    describe('when finding order', () => {
      let result;
      const query: QueryDto = {
        page: 1,
        keyword: '',
        take: 5,
      };
      const stub = orderEntityStub();
      const ex: PaginationDto<OrderLogModel> = {
        count: 1,
        data: [stub],
      };
      beforeEach(async () => {
        jest
          .spyOn(orderRepository, 'findAndCount')
          .mockResolvedValueOnce([[stub], 1]);
        result = await orderService.findAll(query);
      });

      it('should return list of orders', () => {
        expect(result).toEqual(ex);
      });
    });
  });

  describe('findByOrderNumber', () => {
    describe('when finding order', () => {
      let result;
      const stub = orderEntityStub();

      beforeEach(async () => {
        jest.spyOn(orderRepository, 'findOne').mockResolvedValueOnce(stub);
        result = await orderService.findOne(stub.id);
      });

      it('should return an order entity', () => {
        expect(result).toEqual(stub);
      });
    });
  });

  describe('findByOrderNumberWithEntityManager', () => {
    describe('when finding an order', () => {
      let result;
      beforeEach(async () => {
        entityManager.findOne.mockResolvedValueOnce(orderEntityStub());
        result = await orderService.findByOrderNumberWithEntityManager(
          'test',
          entityManager,
        );

        it('should return an order', () => {
          expect(result).toEqual(orderEntityStub());
        });
      });
    });
  });

  describe('findOne', () => {
    describe('when given valid order number', () => {
      let result;
      const stub = orderEntityStub();
      beforeEach(async () => {
        jest.spyOn(orderRepository, 'findOne').mockResolvedValueOnce(stub);
        result = await orderService.findOne(stub.id);
      });

      it('should return order', () => {
        expect(result).toEqual(stub);
      });
    });
  });

  describe('remove', () => {
    describe('should delete order', () => {
      let result;
      const stub = orderEntityStub();
      beforeEach(async () => {
        jest.spyOn(orderRepository, 'findOne').mockResolvedValueOnce(stub);
        jest.spyOn(orderRepository, 'delete').mockResolvedValueOnce(stub);
        result = await orderService.remove(stub.id);
      });

      it('should remove an order', () => {
        expect(result).toEqual(stub);
      });
    });
  });

  describe('update', () => {
    describe('when updating', () => {
      let result;
      const stub = orderEntityStub();
      stub.completed = false;
      const update: OrderLogModel = {
        orderNr: stub.orderNr,
        completed: true,
        id: stub.id,
        logs: stub.logs,
      };

      beforeEach(async () => {
        jest.spyOn(orderService, 'checkOrder').mockResolvedValueOnce(true);
        jest
          .spyOn(orderService, 'findByOrderNumber')
          .mockResolvedValueOnce(stub);
        jest.spyOn(orderRepository, 'update').mockResolvedValueOnce(update);
        jest.spyOn(orderService, 'findOne').mockResolvedValueOnce(update);

        result = await orderService.update(stub.id, update);
      });

      it('should return updated order', () => {
        expect(result).toEqual(update);
      });
    });
  });
});
