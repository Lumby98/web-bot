import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RegisterInsoleDto } from '../dto/insole-upload/register-insole.dto';
import { InsoleService } from '../../core/service/insole.service';
import { UseGuards } from '@nestjs/common';
import { jwtAuthenticationGuard } from '../guard/jwt-authentication.guard';

@WebSocketGateway()
export class InsoleGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private insoleService: InsoleService) {}

  handleConnection(client: any, ...args: any[]): any {
    console.log('client connected ' + client.id);
  }

  handleDisconnect(client: any): any {
    console.log('client disconnected ' + client.id);
  }

  /**
   * starts insole registration
   * @param dto
   * @param client
   */
  @SubscribeMessage('startInsoleRegistration')
  async handleScrape(
    @MessageBody() dto: RegisterInsoleDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const complete = await this.insoleService.registerInsole(dto);
      client.emit('completeInsoleRegistration', complete);
    } catch (err) {
      client.error(err.message);
    }
  }
}
