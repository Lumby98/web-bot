import { OrderTypeEnum } from '../../../../enums/type.enum';
import { DateStringStub } from '../../../../test/stubs/date-string.stub';
import { TargetAndSelectorStub } from '../../../../test/stubs/target-and-selector';
import { orderLogStub } from '../../../../test/stubs/order-log.stub';
import { paginationDtoOrderLogModelStub } from '../../../../test/stubs/pagination-dto-order-log-model.stub';
import { orderEntityStub } from '../../../../test/stubs/order-entity.stub';
import { errorLogStub } from '../../../../test/stubs/error-log.stub';
import { paginationDtoErrorLogModelStub } from '../../../../test/stubs/pagination-dto-error-log-model.stub';
import { errorEntityStub } from '../../../../test/stubs/error-entity.stub';

export const LogErrorService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(errorLogStub()),
  createWithEntityManager: jest.fn().mockResolvedValue(errorLogStub()),
  findOne: jest.fn().mockResolvedValue(errorLogStub()),
  findAll: jest.fn().mockResolvedValue(paginationDtoErrorLogModelStub()),
  update: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
  removeAll: jest.fn().mockResolvedValue(undefined),
  findByMessage: jest.fn().mockResolvedValue(errorEntityStub()),
  findByMessageWithEntityManager: jest
    .fn()
    .mockResolvedValue(errorEntityStub()),
  errorCheck: jest.fn().mockResolvedValue(true),
  errorCheckWithEntityManager: jest.fn().mockResolvedValue(true),
});
