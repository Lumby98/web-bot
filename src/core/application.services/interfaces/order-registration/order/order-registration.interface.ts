import { OrderTypeEnum } from '../../../../enums/type.enum';

export const orderRegistrationInterfaceProvider =
  'orderRegistrationInterfaceProvider';
export interface OrderRegistrationInterface {
  handleOrtowearNavigation(username: string, password: string);
  getOrderType(orderNumber: string): Promise<OrderTypeEnum>;
  checkForInsole(): Promise<boolean>;
  handleNeskridNavigation(username: string, password: string);
  loginValidation(username: string, password: string): boolean;
  InputOrderInformation(
    orderNr: string,
    deliveryAddress: string[],
    insole: boolean,
    EU: boolean,
    customerName: string,
  );
  inputAddress(
    deliveryAddress: string[],
    orderNr: string,
    customerName: string,
  );
  handleOrderCompletion(dev: boolean, completeOrder: boolean): Promise<string>;
  formatDeliveryDate(deliveryDateString: string): Date;
  adjustYear(
    orderYear: number,
    ortowearYear: number,
    counter: number,
  ): Promise<boolean>;
  adjustMonth(
    timeOfDelivery: Date,
    ortowearMonth: string,
    counter: number,
  ): Promise<boolean>;
  getNextDayOfWeek(date: Date, dayOfWeek: number): Date;
  getMonthFromString(month: string): number;
}
