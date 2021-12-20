import { STSOrderModel } from '../../models/sts-order.model';

export const stsOrderStub = (): STSOrderModel => {
  return {
    model: '4502160 Klemtu DUO',
    orderNr: 'dfxdvcxv',
    customerName: 'Ortowear',
    sizeL: '50',
    sizeR: '50',
    widthL: 'Neskrid 66-8',
    widthR: 'Neskrid 66-8',
    sole: 'N173 DUO Grey/Black',
    toeCap: 'Composite',
    deliveryAddress: [
      'Borgervaenget 5',
      '2100 Koebenhavn',
      'Kobenhavn, Denmark',
    ],
    EU: true,
  };
};
