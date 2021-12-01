import { CreateLogOrderDto } from '../../ui.api/dto/log/order/create-log-order.dto';
import { OrderLogModel } from '../models/logEntry/order-log.model';
import { UpdateLogOrderDto } from '../../ui.api/dto/log/order/update-log-order.dto';
import { OrderEntity } from '../../infrastructure/entities/order.entity';

export const orderInterfaceProvider = 'orderInterfaceProvider';

export interface OrderInterface {
  create(createLogOrder: CreateLogOrderDto): Promise<OrderLogModel>;
  findOne(id: number): Promise<OrderLogModel>;
  findAll(): Promise<OrderLogModel[]>;
  update(id: number, updateLogOrder: UpdateLogOrderDto);
  remove(id: number);
  findByOrderNumber(orderNumber: string): Promise<OrderEntity>;
  checkOrder(orderNumber: string): Promise<boolean>;
}
