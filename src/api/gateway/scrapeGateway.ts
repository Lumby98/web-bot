import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { NeskridScraperService } from '../../core/service/neskrid-scraper.service';
import { Socket } from 'socket.io';
import { ScrapeDto } from '../dto/scrape/scrape.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HultaforsScraperService } from '../../core/service/hultafors-scraper.service';

@WebSocketGateway()
export class ScrapeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private neskridScraperService: NeskridScraperService,
    private hultaforsScraperService: HultaforsScraperService,
  ) {}

  @SubscribeMessage('startScrape')
  async handleScrape(
    @MessageBody() dto: ScrapeDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      //checks if there is a username and password
      if (!dto.username || !dto.password || !dto.website) {
        client.error('missing login information');
      }

      let scrapeProducts;
      switch (dto.website) {
        case 'Neskrid': {
          scrapeProducts = await this.neskridScraperService
            .scrapNeskrid(dto.username, dto.password)
            .catch((err) => {
              throw err;
            });
          break;
        }
        case 'Hultafors': {
          scrapeProducts = await this.hultaforsScraperService
            .scrapeHultafors(dto.username, dto.password)
            .catch((err) => {
              throw err;
            });
          break;
        }
        default: {
          throw new Error('Website could not be found');
        }
      }
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
