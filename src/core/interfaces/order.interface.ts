import { CreateLogOrderDto } from '../../ui.api/dto/log/order/create-log-order.dto';
import { UpdateLogOrderDto } from '../../ui.api/dto/log/order/update-log-order.dto';
import { OrderEntity } from '../../infrastructure/entities/order.entity';
import { QueryDto } from '../../ui.api/dto/filter/query.dto';
import { PaginationDto } from '../../ui.api/dto/filter/pagination-dto';
import { OrderLogModel } from '../models/logEntry/order-log.model';
import { EntityManager } from 'typeorm';

export const orderInterfaceProvider = 'orderInterfaceProvider';

export interface OrderInterface {
  create(createLogOrder: CreateLogOrderDto): Promise<OrderLogModel>;
  findOne(id: number): Promise<OrderLogModel>;
  findAll(query: QueryDto): Promise<PaginationDto<OrderLogModel>>;
  update(id: number, updateLogOrder: UpdateLogOrderDto): Promise<OrderLogModel>;
  remove(id: number);
  findByOrderNumber(orderNumber: string): Promise<OrderEntity>;
  findByOrderNumberWithEntityManager(
    orderNumber: string,
    manager: EntityManager,
  ): Promise<OrderEntity>;
  checkOrder(orderNumber: string): Promise<boolean>;
  checkOrderWithEntityManager(
    orderNumber: string,
    manager: EntityManager,
  ): Promise<boolean>;
  createWithEntityManager(
    createLogOrder: CreateLogOrderDto,
    manager: EntityManager,
  ): Promise<OrderLogModel>;
  removeAll();
}
