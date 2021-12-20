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
} from '../../core/application.services/interfaces/scraper/neskrid-scraper.interface';
import {
  HultaforsScraperInterface,
  hultaforsScraperInterfaceProvider,
} from '../../core/application.services/interfaces/scraper/hultafors-scraper.interface';
import {
  SiteInterface,
  siteInterfaceProvider,
} from '../../core/application.services/interfaces/data-collection/site.interface';
import { LoginTypeEnum } from '../../core/enums/loginType.enum';
import {
  savedLoginServiceInterface,
  savedLoginServiceInterfaceProvider,
} from '../../core/application.services/interfaces/auth/savedLoginService.interface';

@WebSocketGateway()
export class ScrapeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(neskridScraperInterfaceProvider)
    private neskridScraperService: NeskridScraperInterface,
    @Inject(hultaforsScraperInterfaceProvider)
    private hultaforsScraperService: HultaforsScraperInterface,
    @Inject(siteInterfaceProvider) private siteService: SiteInterface,
    @Inject(savedLoginServiceInterfaceProvider)
    private readonly savedLoginService: savedLoginServiceInterface,
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
      const neskridLogin = await this.savedLoginService.getLogin(
        LoginTypeEnum.NESKRID,
        dto.key,
      );

      const hultaforsLogin = await this.savedLoginService.getLogin(
        LoginTypeEnum.HULTAFORS,
        dto.key,
      );

      let scrapeProducts;
      //switch determining which site to scrape
      switch (dto.website) {
        case 'Neskrid': {
          scrapeProducts = await this.neskridScraperService
            .scrapNeskrid(neskridLogin.username, neskridLogin.password)
            .catch((err) => {
              throw err;
            });
          break;
        }
        case 'Hultafors': {
          scrapeProducts = await this.hultaforsScraperService
            .scrapeHultafors(hultaforsLogin.username, hultaforsLogin.password)
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
    console.log('client connected scraper ' + client.id);
  }

  handleDisconnect(client: any): any {
    console.log('client disconnected scraper ' + client.id);
  }
}
