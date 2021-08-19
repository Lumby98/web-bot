import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from './scraper.service';
import {
  stubBrowser,
  stubPage,
  stubElementHandle,
} from '../../../test/mock/mockPuppeteer';
import puppeteer from 'puppeteer';

jest.mock('puppeteer', () => ({
  lanuch() {
    return stubBrowser;
  },
}));

describe('ScraperService', () => {
  let service: ScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScraperService],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
