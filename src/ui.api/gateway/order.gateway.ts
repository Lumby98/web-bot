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
import { emit } from 'cluster';
import { take, timestamp } from 'rxjs/operators';
import { LogOrder } from '../dto/order/LogOrder';
import { LogEntryDto } from '../dto/order/LogEntry.dto';
import { date } from '@hapi/joi';

@WebSocketGateway()
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  handleConnection(client: any, ...args: any[]): any {
    console.log('client connected ' + client.id);
  }

  handleDisconnect(client: any): any {
    console.log('client disconnected ' + client.id);
  }

  @SubscribeMessage('startOrderRegistration')
  async handleOrderRegistration(
    @MessageBody() orderReg: OrderRegistrationDto,
    @ConnectedSocket() clientSocket: Socket,
  ): Promise<void> {
    try {
      const orderNumbers = orderReg.orderNumbers;
      let idnum = 0;
      const observable = new Observable((subscriber) => {
        for (const orderNumber of orderNumbers) {
          setTimeout(() => {
            subscriber.next(orderNumber);
          }, 1000);
        }
        subscriber.complete();
      });
      observable.pipe(take(orderNumbers.length)).subscribe((orderNumber) => {
        const logEntryDto: LogEntryDto = {
          id: idnum++,
          desc: orderNumber + 'completed',
          process: 'registration',
          status: true,
          timestamp: Date.now().toString(),
        };
        console.log('emmiting');
        clientSocket.emit('OrderLogEvent', logEntryDto);
      });
    } catch (err) {
      clientSocket.error(err.message);
    }
  }
}
