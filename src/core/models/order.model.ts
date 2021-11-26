export interface OrderModel {
  id?: number;
  orderNr: string;
  customerName: string;
  deliveryAddress: string[];
  timeOfDelivery?: Date;
  EU: boolean;
}
