import { OrderTypeEnum } from '../../../../enums/type.enum';
import { DateStringStub } from '../../../../test/stubs/date-string.stub';
import { TargetAndSelectorStub } from '../../../../test/stubs/target-and-selector';
import { orderLogStub } from '../../../../test/stubs/order-log.stub';
import { paginationDtoOrderLogModelStub } from '../../../../test/stubs/pagination-dto-order-log-model.stub';
import { orderEntityStub } from '../../../../test/stubs/order-entity.stub';

export const OrderService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(orderLogStub()),
  findOne: jest.fn().mockResolvedValue(orderLogStub()),
  findAll: jest.fn().mockResolvedValue(paginationDtoOrderLogModelStub()),
  update: jest.fn().mockResolvedValue(orderLogStub()),
  remove: jest.fn().mockResolvedValue(undefined),
  findByOrderNumber: jest.fn().mockResolvedValue(orderEntityStub()),
  findByOrderNumberWithEntityManager: jest
    .fn()
    .mockResolvedValue(orderEntityStub()),
  checkOrder: jest.fn().mockResolvedValue(true),
  checkOrderWithEntityManager: jest.fn().mockResolvedValue(true),
  createWithEntityManager: jest.fn().mockResolvedValue(orderLogStub()),
  removeAll: jest.fn().mockResolvedValue(undefined),
});
