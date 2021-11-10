import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ScrapeDto } from '../dto/scrape/scrape.dto';
import { ReturnStrapeDto } from '../dto/scrape/return-strape.dto';
import { Inject, UseGuards } from '@nestjs/common';
import {
  NeskridScraperInterface,
  neskridScraperInterfaceProvider,
} from '../../core/interfaces/neskrid-scraper.interface';
import {
  HultaforsScraperInterface,
  hultaforsScraperInterfaceProvider,
} from '../../core/interfaces/hultafors-scraper.interface';
import {
  SiteInterface,
  siteInterfaceProvider,
} from '../../core/interfaces/site.interface';

@WebSocketGateway()
export class ScrapeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(neskridScraperInterfaceProvider)
    private neskridScraperService: NeskridScraperInterface,
    @Inject(hultaforsScraperInterfaceProvider)
    private hultaforsScraperService: HultaforsScraperInterface,
    @Inject(siteInterfaceProvider) private siteService: SiteInterface,
  ) {}

  /**
   * start the scraper
   * @param dto
   * @param client
   */
  @SubscribeMessage('startScrape')
  async handleScrape(
    @MessageBody() dto: ScrapeDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      //checks if there is a username, password and website
      if (!dto.username || !dto.password || !dto.website) {
        client.error('missing login information');
      }

      let scrapeProducts;
      //switch determining which site to scrape
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

      if (scrapeProducts) {
        //updates the lasted scraped for the given site
        const s = await this.siteService.updateSiteAfterScrape(dto.website);
        const r: ReturnStrapeDto = { message: 'complete', sites: s };
        client.emit('completedScrape', r);
      }
    } catch (err) {
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
