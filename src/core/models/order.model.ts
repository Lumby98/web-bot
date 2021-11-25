export interface OrderModel {
  id?: number;
  orderNr: string;
  customerName: string;
  deliveryAddress: string[];
  EU: boolean;
}
