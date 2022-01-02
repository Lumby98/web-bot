import { OrderLogModel } from '../../models/logEntry/order-log.model';

let i = 0;
const orderNumber = 'dfxdvcxv';
export const orderLogStub = (): OrderLogModel => {
  return {
    id: i++,
    orderNr: orderNumber + 'd',
    completed: false,
    logs: [],
  };
};
