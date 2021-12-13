import { OrderInfoModel } from '../../models/order-info.model';

export const orderStub = (): OrderInfoModel => {
  return {
    orderNr: 'dfxdvcxv',
    customerName: 'Ortowear',
    deliveryAddress: [
      'Borgervaenget 5',
      '2100 Koebenhavn',
      'Kobenhavn, Denmark',
    ],
    EU: true,
  };
};
