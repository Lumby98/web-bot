import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../controllers/app.controller';
import { ScraperService } from '../../core/services/scraper/scraper.service';

describe('AppController', () => {
  let appController: AppController;
  let spyService: ScraperService;

  beforeEach(async () => {
    const serviceProvider = {
      provide: ScraperService,
      useFactory: () => ({
        scrapNeskrid: jest.fn(),
      }),
    };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [serviceProvider],
    }).compile();

    appController = app.get<AppController>(AppController);
    spyService = app.get<ScraperService>(ScraperService);
  });

  describe('getScrap', () => {
    it('should pass login check"', async () => {
      const username = 'steve';
      const password = 'password';
      await expect(appController.scrap(username, password)).resolves.toEqual(
        'scrap successful',
      );
      expect(spyService.scrapNeskrid).toHaveBeenCalled();
    });
  });

  it('should throw exception "incomplete login information" (no username test)', () => {
    const username = '';
    const password = 'password';
    return appController
      .scrap(username, password)
      .catch((e) => expect(e).toEqual('incomplete login information'));
  });

  it('should throw exception "incomplete login information" (no password test)', () => {
    const username = 'marc';
    const password = '';
    return appController
      .scrap(username, password)
      .catch((e) => expect(e).toEqual('incomplete login information'));
  });
});
