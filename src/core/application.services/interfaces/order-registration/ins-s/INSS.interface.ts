import { INSSOrderModel } from '../../../../models/ins-s-order.model';

export const iNSSInterfaceProvider = 'iNSSInterfaceProvider';
export interface INSSInterface {
  /**
   * test test
   * @param orderNumber
   */
  handleINSSOrder(orderNumber: string): Promise<INSSOrderModel>;
  inputInssUsageEnvironment(order: INSSOrderModel);
  inputInssModel(order: INSSOrderModel);
  orthotics();
  confirmation();
}
