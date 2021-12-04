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

@WebSocketGateway()
export class OrderRegistrationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(orderRegistrationInterfaceProvider)
    private readonly orderRegistrationService: OrderRegistrationInterface,
    @Inject(savedLoginServiceInterfaceProvider)
    private readonly savedLoginService: savedLoginServiceInterface,
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
      const order = await this.orderRegistrationService.handleOrders(
        orderReg.orderNumbers,
        { username: ortowearLogin.username, password: ortowearLogin.password },
      );

      if (order.STSOrders.length !== 0 && order.INSOrders.length !== 0) {
        const processStep: ProcessStepDto = {
          processStep: ProcessStepEnum.GETORDERINFO,
          error: false,
        };
        clientSocket.emit('processStepEvent', processStep);
      } else {
        const getOrderInfo: ProcessStepDto = {
          processStep: ProcessStepEnum.GETORDERINFO,
          error: true,
          errorMessage: 'Failed to get order info',
        };

        const registerOrder: ProcessStepDto = {
          processStep: ProcessStepEnum.REGISTERORDER,
          error: true,
          errorMessage: 'Previous step failed',
        };

        const alocateOrder: ProcessStepDto = {
          processStep: ProcessStepEnum.ALOCATEORDER,
          error: true,
          errorMessage: 'Previous step failed',
        };

        clientSocket.emit('processStepEvent', getOrderInfo);
        clientSocket.emit('processStepEvent', registerOrder);
        clientSocket.emit('processStepEvent', alocateOrder);
        clientSocket.emit('orderLogEvent', order.logEntries);

        return;
      }

      /*const processSteps: Array<ProcessStepDto> = [
        { processStep: ProcessStepEnum.GETORDERINFO, error: false },
        { processStep: ProcessStepEnum.REGISTERORDER, error: false },
        { processStep: ProcessStepEnum.ALOCATEORDER, error: false },
      ];

      const observable = new Observable<ProcessStepDto>((subscriber) => {
        for (let i = 0; i < processSteps.length; i++) {
          setTimeout(() => {
            subscriber.next(processSteps[i]);
            if (i === processSteps.length - 1) {
              subscriber.complete();
            }
          }, 5000 * (i + 1));
        }
      });

      //Emit logEntries
      const orderNumbers = orderReg.orderNumbers;
      let logIdNum = 1;
      let orderIdNum = 1;
      const logEntries: Array<LogEntryDto> = [];

      for (let i = 0; i <= orderNumbers.length; i++) {
        let logEntryDto: LogEntryDto = {
          id: logIdNum++,
          process: ProcessStepEnum.REGISTERORDER,
          status: true,
          timestamp: new Date(),
          order: {
            id: orderIdNum++,
            orderNr: Math.floor(Math.random() * (10000 - 100) + 100).toString(),
            completed: false,
          },
        };

        if (i == orderNumbers.length) {
          logEntryDto = {
            id: logIdNum++,
            process: ProcessStepEnum.REGISTERORDER,
            status: true,
            timestamp: new Date(),
            order: {
              id: orderIdNum++,
              orderNr: Math.floor(
                Math.random() * (10000 - 100) + 100,
              ).toString(),
              completed: true,
            },
            error: {
              id: orderIdNum++,
              errorMessage: 'could not determine order-registration type ',
            },
          };
        }

        logEntries.push(logEntryDto);
      }

      observable.pipe(take(processSteps.length)).subscribe(
        (processStep) => {
          clientSocket.emit('processStepEvent', processStep);
        },
        (error) => {
          console.log(error);
        },
        () => {
          clientSocket.emit('orderLogEvent', logEntries);
        },
      );*/
    } catch (err) {
      clientSocket.error(err.message);
    }
  }
}
