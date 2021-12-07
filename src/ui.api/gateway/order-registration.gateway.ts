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
import { OrderLists } from '../../core/models/order-lists';

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

      const orders = await this.orderRegistrationService.handleOrders(
        orderReg.orderNumbers,
        { username: ortowearLogin.username, password: ortowearLogin.password },
      );

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
        orders,
        ProcessStepEnum.GETORDERINFO,
        processStepList,
        clientSocket,
      );
      if (!stepCheck) {
        return;
      }

      const regOrders = await this.orderRegistrationService.createOrder(
        orders,
        neskridLogin.username,
        neskridLogin.password,
        false,
        true,
      );

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
        regOrders,
        ProcessStepEnum.REGISTERORDER,
        processStepList,
        clientSocket,
      );

      if (!stepCheck) {
        return;
      }

      const allocatedOrders =
        await this.orderRegistrationService.handleAllocations(
          regOrders,
          ortowearLogin.username,
          ortowearLogin.password,
          false,
          true,
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

      if (!stepCheck) {
        return;
      }

      const logs = await this.logService.createAll(orders.logEntries);

      clientSocket.emit('orderLogEvent', logs);
    } catch (err) {
      clientSocket.error(err.message);
    }
  }

  async handleStep(
    orders: OrderLists,
    processStepEnum: ProcessStepEnum,
    processStepList: ProcessStepDto[],
    clientSocket: Socket,
  ): Promise<boolean> {
    if (orders.STSOrders.length === 0 && orders.INSOrders.length === 0) {
      const logs = await this.logService.createAll(orders.logEntries);

      for (const processStep of processStepList) {
        clientSocket.emit('processStepEvent', processStep);
      }
      clientSocket.emit('orderLogEvent', logs);

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
