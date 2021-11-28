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
      const orderNumbers = orderReg.orderNumbers;
      console.log(orderNumbers);
      let idnum = 1;
      const observable = new Observable((subscriber) => {
        for (let i = 0; i < orderNumbers.length; i++) {
          setTimeout(() => {
            subscriber.next(orderNumbers[i]);
            if (i === orderNumbers.length - 1) {
              subscriber.complete();
            }
          }, 5000 * (i + 1));
        }
      });

      console.log(orderNumbers.length);
      observable.pipe(take(orderNumbers.length)).subscribe((orderNumber) => {
        const logEntryDto: LogEntryDto = {
          id: idnum++,
          desc: orderNumber + 'completed',
          process: 'registration',
          status: true,
          timestamp: Date.now().toString(),
        };
        console.log('emmiting');
        clientSocket.emit('orderLogEvent', logEntryDto);
      });

      console.log('get here');
    } catch (err) {
      clientSocket.error(err.message);
    }
  }
}
