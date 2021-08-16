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
        scrap: jest.fn(() => 'scrap successful'),
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
    it('should pass login check"', () => {
      const username = 'steve';
      const password = 'password';
      appController.scrap(username, password);
      expect(spyService.scrap).toHaveBeenCalled();
    });
  });

  describe('wrongUsername', () => {
    it('should throw exception "incomplete login information"', () => {
      const username = '';
      const password = 'password';
      appController.scrap(username, password);
      expect(spyService.scrap).toHaveBeenCalledTimes(0);
    });
  });

  describe('wrongPassword', () => {
    it('should throw exception "incomplete login information"', () => {
      const username = 'marc';
      const password = '';
      appController.scrap(username, password);
      expect(spyService.scrap).toHaveBeenCalledTimes(0);
    });
  });
});
