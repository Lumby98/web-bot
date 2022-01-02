import { OrderInfoModel } from '../../models/order-info.model';

export const orderStub = (): OrderInfoModel => {
  const newDate = new Date();
  newDate.setDate(newDate.getDate() + 7);
  return {
    orderNr: 'dfxdvcxv',
    customerName: 'Ortowear',
    deliveryAddress: [
      'Borgervaenget 5',
      '2100 Koebenhavn',
      'Kobenhavn, Denmark',
    ],
    timeOfDelivery: newDate,
    EU: true,
  };
};
