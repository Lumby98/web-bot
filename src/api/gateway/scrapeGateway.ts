import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { LoginDto } from '../dto/user/login.dto';
import { NeskridScraperService } from '../../core/service/neskrid-scraper.service';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class ScrapeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private neskridScraperService: NeskridScraperService) {}

  @SubscribeMessage('startScrape')
  async handleScrape(
    @MessageBody() login: LoginDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      console.log("let's gooooooooooooooooooooo");
      //checks if there is a username and password
      if (!login.username || !login.password) {
        client.error('missing login information');
      }
      //starts scraping
      const scrapeProducts = await this.neskridScraperService
        .scrapNeskrid(login.username, login.password)
        .catch((err) => {
          throw err;
        });

      //updates the list in the database using the returned list
      const list = await this.neskridScraperService.updateAfterScrape(
        scrapeProducts,
      );

      if (list) {
        client.emit('completedScrape', 'complete');
      }
    } catch (err) {
      console.log(err);
      client.error(err.message);
    }
  }

  handleConnection(client: any, ...args: any[]): any {
    console.log('client connected ' + client.id);
  }

  handleDisconnect(client: any): any {
    console.log('client disconnected ' + client.id);
  }
}
