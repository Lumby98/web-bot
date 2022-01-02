import { OrderEntity } from '../../../infrastructure/entities/order.entity';

let i = 0;
const orderNumber = 'dfxdvcxv';
export const orderEntityStub = (): OrderEntity => {
  return {
    id: i++,
    orderNr: orderNumber + 'd',
    completed: false,
    logs: [],
  };
};
