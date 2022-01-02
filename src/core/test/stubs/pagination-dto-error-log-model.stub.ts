import { PaginationDto } from '../../../ui.api/dto/filter/pagination-dto';
import { OrderLogModel } from '../../models/logEntry/order-log.model';
import { errorLogStub } from './error-log.stub';
import { ErrorLogModel } from '../../models/logEntry/error-log.model';

export const paginationDtoErrorLogModelStub =
  (): PaginationDto<ErrorLogModel> => {
    return {
      data: [
        errorLogStub(),
        errorLogStub(),
        errorLogStub(),
        errorLogStub(),
        errorLogStub(),
      ],
      count: 5,
    };
  };
