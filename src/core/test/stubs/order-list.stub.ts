import { OrderList } from '../../models/order-list';
import { insOrderStub } from './ins-s-order.stub';
import { stsOrderStub } from './sts-order.stub';
import { ProcessStepEnum } from '../../enums/processStep.enum';

export const orderListStub = (): OrderList => {
  return {
    STSOrder: stsOrderStub(),
    logEntries: [
      {
        status: true,
        process: ProcessStepEnum.GETORDERINFO,
        timestamp: new Date(),
        order: { orderNr: 'randomOrderNumberForTest', completed: false },
      },
    ],
    INSOrder: insOrderStub(),
  };
};
