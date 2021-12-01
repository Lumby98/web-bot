export interface OrderInfoModel {
  id?: number;
  orderNr: string;
  customerName: string;
  deliveryAddress: string[];
  timeOfDelivery?: Date;
  EU: boolean;
}
