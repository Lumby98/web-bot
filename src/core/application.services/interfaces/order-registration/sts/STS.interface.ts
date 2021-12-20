import { STSOrderModel } from '../../../../models/sts-order.model';

export const STSInterfaceProvider = 'STSInterfaceProvider';
export interface STSInterface {
  handleSTSOrder(orderNumber: string): Promise<STSOrderModel>;
  inputStsUsageEnvironment(orderNr: string);
  inputStsModel(model: string, size: string, width: string);
  supplement(insole: boolean, dev: boolean);
}
