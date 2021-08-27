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
          active: 1,
        },
        {
          articleName: 'string',
          articleNo: 'string',
          brandName: 'string',
          active: 2,
        },
      ];
    }),
    findAll: jest.fn(() => {
      return [
        {
          articleName: 'string',
          articleNo: 'string',
          brandName: 'string',
          active: 1,
        },
        {
          articleName: 'string',
          articleNo: 'string',
          brandName: 'string',
          active: 1,
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

  describe('scrape', () => {
    it('should throw exception "incomplete login information" (no username test)', () => {
      return controller
        .scrap('', 'test')
        .catch((e) =>
          expect(e.message).toEqual('incomplete login information'),
        );
    });

    it('should throw exception "incomplete login information" (no password test)', () => {
      return controller
        .scrap('test', '')
        .catch((e) =>
          expect(e.message).toEqual('incomplete login information'),
        );
    });

    it('should scrape neskrid', () => {
      controller.scrap('test', 'test');
      expect(mockScraperService.scrapNeskrid).toHaveBeenCalledWith(
        'test',
        'test',
      );
    });
  });

  describe('getAllProducts', () => {
    it('should return a list of products', () => {
      controller.getAllProducts();
      expect(mockScraperService.findAll).toHaveReturnedWith([
        {
          articleName: 'string',
          articleNo: 'string',
          brandName: 'string',
          active: 1,
        },
        {
          articleName: 'string',
          articleNo: 'string',
          brandName: 'string',
          active: 1,
        },
      ]);
    });
  });
});
