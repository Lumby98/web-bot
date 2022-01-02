import { Injectable } from '@nestjs/common';
import { OrderInterface } from '../../interfaces/log/order.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from '../../../../infrastructure/entities/order.entity';
import { EntityManager, Like, Repository } from 'typeorm';
import { CreateLogOrderDto } from '../../../../ui.api/dto/log/order/create-log-order.dto';
import { OrderLogModel } from '../../../models/logEntry/order-log.model';
import { UpdateLogOrderDto } from '../../../../ui.api/dto/log/order/update-log-order.dto';
import { QueryDto } from '../../../../ui.api/dto/filter/query.dto';
import { PaginationDto } from '../../../../ui.api/dto/filter/pagination-dto';

@Injectable()
export class OrderService implements OrderInterface {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
  ) {}

  /**
   * tries to find the given order
   * @param orderNumber
   */
  async checkOrder(orderNumber: string): Promise<boolean> {
    const order = await this.orderRepository.findOne({
      where: { orderNr: orderNumber },
    });

    return !!order;
  }

  /**
   * checks the order with entity manager to facilitate transactions
   * @param orderNumber
   * @param manager
   */
  async checkOrderWithEntityManager(
    orderNumber: string,
    manager: EntityManager,
  ): Promise<boolean> {
    const order = await manager.findOne(OrderEntity, {
      where: { orderNr: orderNumber },
    });

    return !!order;
  }

  /**
   * creates order and also outputs a log entry
   * @param createLogOrder
   */
  async create(createLogOrder: CreateLogOrderDto): Promise<OrderLogModel> {
    const orderCheck = await this.checkOrder(createLogOrder.orderNr);
    if (orderCheck) {
      throw new Error(
        'Cant create order, an order with this order number already exists',
      );
    }
    const orderEntity = this.orderRepository.create(createLogOrder);
    return JSON.parse(
      JSON.stringify(await this.orderRepository.save(orderEntity)),
    );
  }
  /**
   * creates order with entity manager to facilitate transactions
   * @param createLogOrder
   * @param manager
   */
  async createWithEntityManager(
    createLogOrder: CreateLogOrderDto,
    manager: EntityManager,
  ): Promise<OrderLogModel> {
    const orderCheck = await this.checkOrderWithEntityManager(
      createLogOrder.orderNr,
      manager,
    );
    if (orderCheck) {
      throw new Error(
        'Cant create order, an order with this order number already exists',
      );
    }
    const orderEntity = manager.create(OrderEntity, createLogOrder);
    return JSON.parse(
      JSON.stringify(await manager.save(OrderEntity, orderEntity)),
    );
  }

  /**
   * finds all order entries and paginates them
   * @param query
   */
  async findAll(query: QueryDto): Promise<PaginationDto<OrderLogModel>> {
    const take = query.take || 10;
    const skip = query.page || 1;
    const keyword = query.keyword || '';

    const [result, total] = await this.orderRepository.findAndCount({
      where: { orderNr: Like('%' + keyword + '%') },
      order: { id: 'DESC' },
      take: take,
      skip: (skip - 1) * take,
    });

    const models = JSON.parse(JSON.stringify(result));

    return {
      data: models,
      count: total,
    };
  }

  /**
   * finds an order with the given order number
   * @param orderNumber
   */
  async findByOrderNumber(orderNumber: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { orderNr: orderNumber },
    });

    return order;
  }

  /**
   * finds order with entity manager to facilitate transactions
   * @param orderNumber
   * @param manager
   */
  async findByOrderNumberWithEntityManager(
    orderNumber: string,
    manager: EntityManager,
  ): Promise<OrderEntity> {
    const order = await manager.findOne(OrderEntity, {
      where: { orderNr: orderNumber },
    });

    return order;
  }

  /**
   * finds one order by id
   * @param id
   */
  async findOne(id: number): Promise<OrderLogModel> {
    const order = await this.orderRepository.findOne(id, {
      relations: ['logs'],
    });
    if (!order) {
      throw new Error('could not find order with given id');
    }
    return JSON.parse(JSON.stringify(order));
  }

  /**
   * removes order by given id
   * @param id
   */
  async remove(id: number) {
    try {
      const order = await this.findOne(id);

      return await this.orderRepository.delete(id);
    } catch (err) {
      throw new Error('failed to delete: could not find');
    }
  }

  /**
   * removes all orders
   */
  async removeAll() {
    await this.orderRepository.clear();
  }

  /**
   * updates order with given id
   * @param id
   * @param updateLogOrder
   */
  async update(
    id: number,
    updateLogOrder: UpdateLogOrderDto,
  ): Promise<OrderLogModel> {
    const orderCheck = await this.checkOrder(updateLogOrder.orderNr);

    if (!orderCheck) {
      throw new Error('This order does not exist');
    }

    if (id != updateLogOrder.id) {
      throw new Error(
        'Invalid arguments: Provided id and the id of the update dto do not match.',
      );
    }

    const orderByOrderNr = await this.findByOrderNumber(updateLogOrder.orderNr);

    if (updateLogOrder.id != orderByOrderNr.id) {
      throw new Error(
        'Tried changing order number: It is forbidden to change an orders order number',
      );
    }

    await this.orderRepository.update({ id: id }, updateLogOrder);

    const updatedOrder = await this.findOne(id);

    if (updatedOrder) {
      if (
        updatedOrder.orderNr == updateLogOrder.orderNr &&
        updatedOrder.id == updateLogOrder.id &&
        updatedOrder.completed == updateLogOrder.completed
      ) {
        return updatedOrder;
      } else {
        throw new Error('Failed to update order');
      }
    } else {
      throw new Error('Failed to updated order');
    }
  }
}
