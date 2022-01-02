import { LogEntity } from '../../../infrastructure/entities/log.entity';
import { orderEntityStub } from './order-entity.stub';
import { ProcessStepEnum } from '../../enums/processStep.enum';
import { errorEntityStub } from './error-entity.stub';

export const logEntityStub = (): LogEntity => {
  return {
    id: 1,
    order: orderEntityStub(),
    status: true,
    process: ProcessStepEnum.GETORDERINFO,
    error: errorEntityStub(),
    timestamp: new Date(),
  };
};
