import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from './scraper.service';
import { Repository } from 'typeorm';
import { Product } from '../infrastructure/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ScraperService', () => {
  let service: ScraperService;
  let repo: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScraperService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
    repo = module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of products', async () => {
      const testProduct: Product[] = [
        {
          id: 'this',
          brand: 'is',
          articleName: 'a',
          articleNo: 'test',
          active: 1,
        },
      ];
      jest.spyOn(repo, 'find').mockResolvedValueOnce(testProduct);
      const result = await service.findAll();
      expect(result).toEqual(testProduct);
      expect(repo.find).toHaveBeenCalled();
    });

    it('should throw an error if there is no products in the list', async () => {
      const test: Product[] = undefined;
      jest.spyOn(repo, 'find').mockResolvedValueOnce(test);
      await expect(service.findAll()).rejects.toThrow();
      expect(repo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find one product based on brand and article name', async () => {
      const testProduct = {
        id: 'this',
        brand: 'is',
        articleName: 'a',
        articleNo: 'test',
        active: 1,
      };
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(testProduct);
      const expected = await service.findOne(
        testProduct.brand,
        testProduct.articleName,
      );
      expect(expected).toEqual(testProduct);
      expect(repo.findOne).toHaveBeenCalled();
    });

    it('should throw an error if the product does not exist', () => {
      const testProduct = {
        id: 'this',
        brand: 'is',
        articleName: 'a',
        articleNo: 'test',
        active: 1,
      };
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(undefined);
      expect(
        async () =>
          await service.findOne(testProduct.brand, testProduct.articleName),
      ).rejects.toThrow();
      expect(repo.findOne).toHaveBeenCalled();
    });

    describe('create', () => {
      it('should create a product', async () => {
        const testProduct: Product = {
          id: 'this',
          brand: 'is',
          articleName: 'a',
          articleNo: 'test',
          active: 1,
        };
        const testProductToCreate = {
          brand: 'is',
          articleName: 'a',
          articleNo: 'test',
          active: 1,
        };
        jest.spyOn(repo, 'create').mockImplementationOnce(() => {
          return testProduct;
        });
        jest.spyOn(repo, 'findOne').mockImplementationOnce(() => {
          return undefined;
        });
        const expected = await service.create(testProductToCreate);
        expect(expected).toEqual(testProduct);
        expect(repo.create).toHaveBeenCalledWith(testProductToCreate);
      });
      it('should throw an error if product could not be created', () => {
        const testProduct: Product = {
          id: 'this',
          brand: 'is',
          articleName: 'a',
          articleNo: 'test',
          active: 1,
        };
        jest.spyOn(repo, 'create').mockImplementationOnce(() => undefined);
        expect(async () => {
          await service.create(testProduct);
        }).rejects.toThrow();
      });
    });
    describe('update', () => {
      it('should update a product', () => {
        const testProductUpdate: Product = {
          id: 'this',
          brand: 'test',
          articleName: 'a',
          articleNo: 'test',
          active: 1,
        };
        const testProduct: Product = {
          id: 'this',
          brand: 'is',
          articleName: 'a',
          articleNo: 'test',
          active: 1,
        };
        jest.spyOn(repo, 'update').mockResolvedValueOnce(testProduct);
        testProductUpdate.brand = 'is';
        expect(async () => {
          await service.update(testProductUpdate);
        }).toEqual(testProduct);
      });
      it('should throw an error if product could not be updated', () => {
        const testProduct: Product = {
          id: 'this',
          brand: 'is',
          articleName: 'a',
          articleNo: 'test',
          active: 1,
        };
        jest.spyOn(repo, 'update').mockResolvedValueOnce(undefined);
        expect(async () => {
          await service.update(testProduct);
        }).rejects.toThrow();
      });
    });
  });
});
