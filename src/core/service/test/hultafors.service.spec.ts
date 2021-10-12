import { Test, TestingModule } from '@nestjs/testing';
import { HultaforsService } from '../hultafors.service';
import { Repository } from 'typeorm';
import { HultaforsProduct } from '../../../infrastructure/entities/hultafors.product.entity';
import { Size } from '../../../infrastructure/entities/size.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { find } from 'rxjs/operators';
import { SizeModel } from '../../models/size.model';

describe('HultaforsService', () => {
  let service: HultaforsService;
  let hultaforsRepo: Repository<HultaforsProduct>;
  let sizeRepo: Repository<Size>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HultaforsService,
        {
          provide: getRepositoryToken(HultaforsProduct),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Size),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<HultaforsService>(HultaforsService);
    hultaforsRepo = module.get(getRepositoryToken(HultaforsProduct));
    sizeRepo = module.get(getRepositoryToken(Size));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hultafors', () => {
    describe('findAll', () => {
      it('should return list of products with sizes', async () => {
        const testProducts: HultaforsProduct[] = [
          {
            id: 'test',
            articleNumber: 'test',
            articleName: 'test',
            sizes: [
              { size: 43, status: 1, date: 'test', product: this, id: 'test' },
            ],
          },
          {
            id: 'test',
            articleNumber: 'test',
            articleName: 'test',
            sizes: [
              { size: 43, status: 1, date: 'test', product: this, id: 'test' },
            ],
          },
        ];

        jest.spyOn(hultaforsRepo, 'find').mockResolvedValueOnce(testProducts);
        const expected = await service.findAllProducts();
        expect(expected).toEqual(testProducts);
      });
    });

    describe('findByArticleName', () => {
      it('should get one product', async () => {
        const testProduct: HultaforsProduct = {
          id: 'test',
          articleNumber: 'test',
          articleName: 'test',
          sizes: [
            { size: 43, status: 1, date: 'test', product: this, id: 'test' },
          ],
        };
        jest.spyOn(hultaforsRepo, 'findOne').mockResolvedValueOnce(testProduct);
        const expected = await service.findProductByArticleName(
          testProduct.articleName,
        );
        expect(expected).toEqual(testProduct);
      });

      it('should throw error if product does not exist', () => {
        jest.spyOn(hultaforsRepo, 'findOne').mockResolvedValueOnce(undefined);
        expect(
          async () => await service.findProductByArticleName('test'),
        ).rejects.toThrow();
      });
    });

    describe('create', () => {
      it('should create a product', async () => {
        const testProduct: HultaforsProduct = {
          id: 'test',
          articleNumber: 'test',
          articleName: 'test',
          sizes: [
            { size: 43, status: 1, date: 'test', product: this, id: 'test' },
          ],
        };

        jest.spyOn(hultaforsRepo, 'findOne').mockResolvedValueOnce(undefined);
        jest.spyOn(sizeRepo, 'create').mockImplementationOnce(() => {
          return testProduct.sizes[0];
        });
        jest
          .spyOn(sizeRepo, 'save')
          .mockResolvedValueOnce(testProduct.sizes[0]);
        jest.spyOn(hultaforsRepo, 'create').mockImplementationOnce(() => {
          return testProduct;
        });
        jest.spyOn(hultaforsRepo, 'save').mockResolvedValueOnce(testProduct);
        const expectedSize: SizeModel = {
          size: testProduct.sizes[0].size,
          status: testProduct.sizes[0].status,
          productName: testProduct.sizes[0].product.articleName,
          date: testProduct.sizes[0].date,
        };
        const expected = await service.createProduct({
          articleName: testProduct.articleName,
          articleNumber: testProduct.articleNumber,
          sizes: [expectedSize],
        });
        expect(expected).toEqual(testProduct);
      });

      it('should throw error if product already exist', () => {
        const testProduct: HultaforsProduct = {
          id: 'test',
          articleNumber: 'test',
          articleName: 'test',
          sizes: [
            { size: 43, status: 1, date: 'test', product: this, id: 'test' },
          ],
        };
        jest.spyOn(hultaforsRepo, 'findOne').mockResolvedValueOnce(testProduct);
        const expectedSize: SizeModel = {
          size: testProduct.sizes[0].size,
          status: testProduct.sizes[0].status,
          productName: testProduct.sizes[0].product.articleName,
          date: testProduct.sizes[0].date,
        };
        expect(
          async () =>
            await service.createProduct({
              articleName: testProduct.articleName,
              articleNumber: testProduct.articleNumber,
              sizes: [expectedSize],
            }),
        ).rejects.toThrow();
      });

      it('should throw error if product is not created', () => {
        const testProduct: HultaforsProduct = {
          id: 'test',
          articleNumber: 'test',
          articleName: 'test',
          sizes: [
            { size: 43, status: 1, date: 'test', product: this, id: 'test' },
          ],
        };

        jest.spyOn(hultaforsRepo, 'findOne').mockResolvedValueOnce(undefined);
        jest.spyOn(sizeRepo, 'create').mockImplementationOnce(() => {
          return testProduct.sizes[0];
        });
        jest
          .spyOn(sizeRepo, 'save')
          .mockResolvedValueOnce(testProduct.sizes[0]);
        jest.spyOn(hultaforsRepo, 'create').mockImplementationOnce(undefined);
        jest.spyOn(hultaforsRepo, 'save').mockResolvedValueOnce(undefined);
        const expectedSize: SizeModel = {
          size: testProduct.sizes[0].size,
          status: testProduct.sizes[0].status,
          productName: testProduct.sizes[0].product.articleName,
          date: testProduct.sizes[0].date,
        };
        expect(
          async () =>
            await service.createProduct({
              articleName: testProduct.articleName,
              articleNumber: testProduct.articleNumber,
              sizes: [expectedSize],
            }),
        ).rejects.toThrow();
      });
    });

    describe('edit', () => {
      it('should edit a product', async () => {
        const testProductToUpdate: HultaforsProduct = {
          id: 'test',
          articleNumber: 't',
          articleName: 'test',
          sizes: [
            { size: 43, status: 1, date: 'tes', product: this, id: 'test' },
          ],
        };
        const testProduct: HultaforsProduct = {
          id: 'test',
          articleNumber: 'test',
          articleName: 'test',
          sizes: [
            { size: 43, status: 1, date: 'test', product: this, id: 'test' },
          ],
        };

        jest
          .spyOn(hultaforsRepo, 'findOne')
          .mockResolvedValueOnce(testProductToUpdate);
        jest.spyOn(hultaforsRepo, 'save').mockResolvedValueOnce(testProduct);
        jest
          .spyOn(service, 'editSize')
          .mockResolvedValueOnce(
            JSON.parse(JSON.stringify(testProduct.sizes[0])),
          );
        const expected = await service.editProduct(
          testProductToUpdate.articleName,
          {
            articleName: testProduct.articleName,
            articleNumber: testProduct.articleNumber,
            sizes: [JSON.parse(JSON.stringify(testProduct.sizes[0]))],
            id: testProduct.id,
          },
        );
        expect(expected).toEqual(testProduct);
      });

      it('should throw error if product does not exist', () => {});
      it('should throw error if product is not updated', () => {});
    });

    describe('delete', () => {
      it('should delete a product', () => {});
      it('should throw error if product does not exist', () => {});
      it('should throw error if product is not deleted', () => {});
    });
  });

  describe('size', () => {
    describe('create', () => {
      it('should create a size', () => {});
      it('should throw error if size already exist', () => {});
      it('should throw error if size is not created', () => {});
    });

    describe('edit', () => {
      it('should should edit a size', () => {});
      it('should throw error if size does not exist', () => {});
      it('should throw error if size has not been edited', () => {});
    });

    describe('delete', () => {
      it('should delete a size', () => {});
      it('should throw error if size does not exist', () => {});
      it('should throw error if size has not been deleted', () => {});
    });
  });
});
