import { INSSOrderModel } from '../../models/ins-s-order.model';

export const insOrderStub = (): INSSOrderModel => {
  return {
    orderNr: 'dfxdvcxv',
    deliveryAddress: [
      'Borgervaenget 5',
      '2100 Koebenhavn',
      'Kobenhavn, Denmark',
    ],
    customerName: 'Sahva A/S',
    EU: true,
    model: 'Jalas 7100 Evo',
    sizeL: '45 EU',
    sizeR: '45 EU',
  };
};
