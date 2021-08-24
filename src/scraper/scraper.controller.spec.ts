import { Test, TestingModule } from '@nestjs/testing';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';

describe('ScraperController', () => {
  let controller: ScraperController;
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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScraperController],
      providers: [ScraperService],
    })
      .overrideProvider(ScraperService)
      .useValue(mockScraperService)
      .compile();

    controller = module.get<ScraperController>(ScraperController);
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
