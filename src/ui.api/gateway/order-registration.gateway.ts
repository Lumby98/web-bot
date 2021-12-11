import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { OrderRegistrationDto } from '../dto/order-registration/orderRegistrationDto';
import { Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import {
  OrderRegistrationInterface,
  orderRegistrationInterfaceProvider,
} from '../../core/interfaces/order-registration.interface';
import {
  savedLoginServiceInterface,
  savedLoginServiceInterfaceProvider,
} from '../../core/interfaces/savedLoginService.interface';
import { LoginTypeEnum } from '../../core/enums/loginType.enum';
import { ProcessStepDto } from '../dto/order-registration/processStep.dto';
import { ProcessStepEnum } from '../../core/enums/processStep.enum';
import {
  LogInterface,
  logInterfaceProvider,
} from '../../core/interfaces/log.interface';
import { OrderList } from '../../core/models/order-list';
import { OrderWithLogs } from '../../core/models/orderWithLogs';
import { ConfigService } from '@nestjs/config';
import { CreateLogDto } from '../dto/log/logEntry/create-log.dto';

@WebSocketGateway()
export class OrderRegistrationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(orderRegistrationInterfaceProvider)
    private readonly orderRegistrationService: OrderRegistrationInterface,
    @Inject(savedLoginServiceInterfaceProvider)
    private readonly savedLoginService: savedLoginServiceInterface,
    @Inject(logInterfaceProvider)
    private readonly logService: LogInterface,
    private configService: ConfigService,
  ) {}
  handleConnection(client: any, ...args: any[]): any {
    console.log('client connected order-registration gateway ' + client.id);
  }

  handleDisconnect(client: any): any {
    console.log('client disconnected order-registration gateway ' + client.id);
  }

  @SubscribeMessage('startOrderRegistration')
  async handleOrderRegistration(
    @MessageBody() orderReg: OrderRegistrationDto,
    @ConnectedSocket() clientSocket: Socket,
  ): Promise<void> {
    try {
      const ortowearLogin = await this.savedLoginService.getLogin(
        LoginTypeEnum.ORTOWEAR,
        orderReg.key,
      );

      const neskridLogin = await this.savedLoginService.getLogin(
        LoginTypeEnum.NESKRID,
        orderReg.key,
      );

      const listLogEntries: CreateLogDto[] = [];
      for (const orderNumber of orderReg.orderNumbers) {
        const orders = await this.orderRegistrationService.handleOrders(
          orderNumber,
          {
            username: ortowearLogin.username,
            password: ortowearLogin.password,
          },
        );

        const orderWithLogs = this.orderListToOrderWithLogs(orders);

        let processStepList: ProcessStepDto[] = [
          {
            processStep: ProcessStepEnum.GETORDERINFO,
            error: true,
            errorMessage: 'Failed to get order info',
          },
          {
            processStep: ProcessStepEnum.REGISTERORDER,
            error: true,
            errorMessage: 'Previous step failed',
          },
          {
            processStep: ProcessStepEnum.ALOCATEORDER,
            error: true,
            errorMessage: 'Previous step failed',
          },
        ];
        let stepCheck = await this.handleStep(
          orderWithLogs,
          ProcessStepEnum.GETORDERINFO,
          processStepList,
          clientSocket,
        );
        if (!stepCheck) {
          continue;
        }

        const regOrders = await this.orderRegistrationService.createOrder(
          orders,
          neskridLogin.username,
          neskridLogin.password,
          this.configService.get('DEV'),
          this.configService.get('COMPLETEORDER'),
        );

        const regOrderWithLogs = this.orderListToOrderWithLogs(regOrders);

        processStepList = [
          {
            processStep: ProcessStepEnum.REGISTERORDER,
            error: true,
            errorMessage: 'Register orders failed',
          },
          {
            processStep: ProcessStepEnum.ALOCATEORDER,
            error: true,
            errorMessage: 'Previous step failed',
          },
        ];

        stepCheck = await this.handleStep(
          regOrderWithLogs,
          ProcessStepEnum.REGISTERORDER,
          processStepList,
          clientSocket,
        );

        if (!stepCheck) {
          continue;
        }

        const allocatedOrders =
          await this.orderRegistrationService.handleAllocations(
            regOrderWithLogs,
            ortowearLogin.username,
            ortowearLogin.password,
            this.configService.get('DEV'),
            this.configService.get('COMPLETEORDER'),
          );

        processStepList = [
          {
            processStep: ProcessStepEnum.ALOCATEORDER,
            error: true,
            errorMessage: 'Failed to allocate orders',
          },
        ];

        stepCheck = await this.handleStep(
          allocatedOrders,
          ProcessStepEnum.ALOCATEORDER,
          processStepList,
          clientSocket,
        );

        listLogEntries.push(...allocatedOrders.logEntries);
      }

      const logs = await this.logService.createAll(listLogEntries);

      clientSocket.emit('orderLogEvent', logs);
    } catch (err) {
      clientSocket.error(err.message);
    }
  }

  orderListToOrderWithLogs(orders: OrderList): OrderWithLogs {
    if (orders.STSOrder) {
      return {
        order: {
          orderNr: orders.STSOrder.orderNr,
          id: orders.STSOrder.id,
          EU: orders.STSOrder.EU,
          customerName: orders.STSOrder.customerName,
          deliveryAddress: orders.STSOrder.deliveryAddress,
          timeOfDelivery: orders.STSOrder.timeOfDelivery,
        },
        logEntries: orders.logEntries,
        insole: orders.STSOrder.insole,
      };
    } else if (orders.INSOrder) {
      return {
        order: {
          orderNr: orders.INSOrder.orderNr,
          id: orders.INSOrder.id,
          EU: orders.INSOrder.EU,
          customerName: orders.INSOrder.customerName,
          deliveryAddress: orders.INSOrder.deliveryAddress,
          timeOfDelivery: orders.INSOrder.timeOfDelivery,
        },
        logEntries: orders.logEntries,
        insole: true,
      };
    } else {
      return {
        order: undefined,
        logEntries: orders.logEntries,
        insole: false,
      };
    }
  }

  async handleStep(
    orders: OrderWithLogs,
    processStepEnum: ProcessStepEnum,
    processStepList: ProcessStepDto[],
    clientSocket: Socket,
  ): Promise<boolean> {
    if (!orders.order) {
      for (const processStep of processStepList) {
        clientSocket.emit('processStepEvent', processStep);
      }

      return false;
    } else {
      const processStep: ProcessStepDto = {
        processStep: processStepEnum,
        error: false,
      };
      clientSocket.emit('processStepEvent', processStep);
      return true;
    }
  }
}
