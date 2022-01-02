import { PaginationDto } from '../../../ui.api/dto/filter/pagination-dto';
import { OrderLogModel } from '../../models/logEntry/order-log.model';
import { orderLogStub } from './order-log.stub';

export const paginationDtoOrderLogModelStub =
  (): PaginationDto<OrderLogModel> => {
    return {
      data: [
        orderLogStub(),
        orderLogStub(),
        orderLogStub(),
        orderLogStub(),
        orderLogStub(),
      ],
      count: 5,
    };
  };
