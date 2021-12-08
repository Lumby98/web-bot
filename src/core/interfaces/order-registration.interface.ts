import { OrderInfoModel } from '../models/order-info.model';
import { OrderTypeEnum } from '../enums/type.enum';
import { LoginDto } from '../../ui.api/dto/user/login.dto';
import { OrderLists } from '../models/order-lists';
import { OrderList } from '../models/order-list';
export const orderRegistrationInterfaceProvider =
  'orderRegistrationInterfaceProvider';
export interface OrderRegistrationInterface {
  handleOrders(orderNumber: string, login: LoginDto): Promise<OrderList>;
  startPuppeteer(url: string);
  stopPuppeteer();
  getOrderType(orderNumber: string): Promise<OrderTypeEnum>;
  formatDeliveryDate(deliveryDateString: string): Date;
  getNextDayOfWeek(date: Date, dayOfWeek: number): Date;
  getMonthFromString(month: string): number;
  createOrder(
    orders: OrderLists,
    username: string,
    password: string,
    dev: boolean,
    completeOrder: boolean,
  ): Promise<OrderLists>;
  handleAllocations(
    orders: OrderLists,
    username: string,
    password: string,
    dev: boolean,
    completeOrder: boolean,
  ): Promise<OrderLists>;
}
