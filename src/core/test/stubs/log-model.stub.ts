import { ProcessStepEnum } from '../../enums/processStep.enum';
import { orderLogStub } from './order-log.stub';
import { errorLogStub } from './error-log.stub';
import { LogModel } from '../../models/logEntry/log.model';

export const logModelStub = (): LogModel => {
  return {
    id: 1,
    order: orderLogStub(),
    status: true,
    process: ProcessStepEnum.GETORDERINFO,
    error: errorLogStub(),
    timestamp: new Date(),
  };
};
