import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { OrderRegistrationDto } from '../dto/order/orderRegistrationDto';
import { Socket } from 'socket.io';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { LogEntryDto } from '../dto/order/LogEntry.dto';
import { ProcessStepDto } from '../dto/order/processStep.dto';
import { ProcessStepEnum } from '../../core/enums/processStep.enum';
import { LogOrderDto } from '../dto/order/LogOrder.dto';

@WebSocketGateway()
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  handleConnection(client: any, ...args: any[]): any {
    console.log('client connected order gateway ' + client.id);
  }

  handleDisconnect(client: any): any {
    console.log('client disconnected order gateway ' + client.id);
  }

  @SubscribeMessage('startOrderRegistration')
  async handleOrderRegistration(
    @MessageBody() orderReg: OrderRegistrationDto,
    @ConnectedSocket() clientSocket: Socket,
  ): Promise<void> {
    try {
      const processSteps: Array<ProcessStepDto> = [
        { processStep: ProcessStepEnum.GETORDERINFO, error: false },
        { processStep: ProcessStepEnum.GETORDER, error: false },
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
      let idnum = 1;
      const logEntries: Array<LogEntryDto> = [];

      for (let i = 0; i < orderNumbers.length; i++) {
        const logOrder: LogOrderDto = {
          id: idnum++,
          orderNumber: orderNumbers[i],
          completed: true,
        };

        const logEntryDto: LogEntryDto = {
          id: idnum++,
          process: 'registration',
          status: true,
          timestamp: new Date(),
          order: logOrder,
        };

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
      );
    } catch (err) {
      clientSocket.error(err.message);
    }
  }
}
