import { OrderModel } from '../models/order.model';
import { OrderTypeEnum } from '../enums/type.enum';
import { LoginDto } from '../../ui.api/dto/user/login.dto';
export const orderInterfaceProvider = 'orderInterfaceProvider';
export interface OrderInterface {
  handleOrders(orderNumbers: string[], login: LoginDto): Promise<OrderModel[]>;
  startPuppeteer(url: string);
  stopPuppeteer();
  getOrderType(orderNumber: string): Promise<OrderTypeEnum>;
}
