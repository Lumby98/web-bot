import { OrderWithLogs } from '../../models/orderWithLogs';
import { ProcessStepEnum } from '../../enums/processStep.enum';
import { orderStub } from './order-stub';

export const orderWithLogsStub = (): OrderWithLogs => {
  return {
    order: orderStub(),
    insole: true,
    logEntries: [
      {
        status: true,
        process: ProcessStepEnum.GETORDERINFO,
        timestamp: new Date(),
        order: { orderNr: 'randomOrderNumberForTest', completed: false },
      },
      {
        status: true,
        process: ProcessStepEnum.REGISTERORDER,
        timestamp: new Date(),
        order: { orderNr: 'dfxdvcxv', completed: false },
      },
    ],
  };
};
