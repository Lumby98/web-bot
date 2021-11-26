import { STSOrderModel } from '../../models/sts-order.model';

export const StsOrderStub = (): STSOrderModel => {
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
    deliveryAddress: 'Mukkerten 21\n' + '6715 Esbjerg N\n' + 'Ribe, Denmark',
  };
};
