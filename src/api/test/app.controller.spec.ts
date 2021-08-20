import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../controllers/app.controller';
import { ScraperService } from '../../core/services/scraper/scraper.service';

describe('AppController', () => {
  let controller: AppController;
  const mockScraperService = {
    scrapNeskrid: jest.fn(() => {
      return [
        {
          articleName: 'string',
          articleNo: 'string',
          brandName: 'string',
        },
        {
          articleName: 'string',
          articleNo: 'string',
          brandName: 'string',
        },
      ];
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [ScraperService],
    })
      .overrideProvider(ScraperService)
      .useValue(mockScraperService)
      .compile();

    controller = app.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw exception "incomplete login information" (no username test)', () => {
    return controller
      .scrap('', 'test')
      .catch((e) => expect(e.message).toEqual('incomplete login information'));
  });

  it('should throw exception "incomplete login information" (no password test)', () => {
    return controller
      .scrap('test', '')
      .catch((e) => expect(e.message).toEqual('incomplete login information'));
  });

  it('should scrape neskrid', () => {
    controller.scrap('test', 'test');
    expect(mockScraperService.scrapNeskrid).toHaveBeenCalledWith(
      'test',
      'test',
    );
  });
});
