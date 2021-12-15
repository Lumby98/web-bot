import { Test, TestingModule } from '@nestjs/testing';
import { HultaforsService } from '../application.services/implementations/data-collection/hultafors.service';
import { Repository } from 'typeorm';
import { HultaforsProduct } from '../../infrastructure/entities/hultafors.product.entity';
import { Size } from '../../infrastructure/entities/size.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SizeModel } from '../models/size.model';

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
        jest.spyOn(hultaforsRepo, 'findOne').mockResolvedValueOnce(testProduct);
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

      it('should throw error if product does not exist', () => {
        jest.spyOn(hultaforsRepo, 'findOne').mockResolvedValueOnce(undefined);
        expect(async () => {
          await service.editProduct('test', {
            articleName: 't',
            articleNumber: 'e',
            id: 's',
            sizes: [],
          });
        }).rejects.toThrow();
      });

      it('should throw error if product is not updated', () => {
        const testProduct: HultaforsProduct = {
          articleName: 'test',
          articleNumber: 'test',
          sizes: [],
          id: 'test',
        };
        jest.spyOn(hultaforsRepo, 'findOne').mockResolvedValueOnce(testProduct);
        jest.spyOn(hultaforsRepo, 'save').mockResolvedValueOnce(undefined);
        jest.spyOn(hultaforsRepo, 'findOne').mockResolvedValueOnce(undefined);

        expect(async () => {
          await service.editProduct(testProduct.articleName, {
            articleName: 't',
            articleNumber: 't',
            sizes: [],
            id: 'test',
          });
        }).rejects.toThrow();
      });
    });

    describe('delete', () => {
      it('should delete a product', async () => {
        const testPrduct: HultaforsProduct = {
          articleName: 'test',
          articleNumber: 'test',
          sizes: [],
          id: 'test',
        };
        jest.spyOn(hultaforsRepo, 'findOne').mockResolvedValueOnce(testPrduct);
        jest.spyOn(hultaforsRepo, 'remove').mockResolvedValueOnce(testPrduct);
        jest.spyOn(hultaforsRepo, 'findOne').mockResolvedValueOnce(undefined);

        const expected = await service.deleteProduct(testPrduct.articleName);
        expect(expected).toEqual(true);
      });

      it('should throw error if product does not exist', () => {
        jest.spyOn(hultaforsRepo, 'findOne').mockResolvedValueOnce(undefined);
        expect(
          async () => await service.deleteProduct('test'),
        ).rejects.toThrow();
      });

      it('should throw error if product is not deleted', () => {
        const testPrduct: HultaforsProduct = {
          articleName: 'test',
          articleNumber: 'test',
          sizes: [],
          id: 'test',
        };
        jest.spyOn(hultaforsRepo, 'findOne').mockResolvedValueOnce(testPrduct);
        jest.spyOn(hultaforsRepo, 'remove').mockResolvedValueOnce(testPrduct);
        jest.spyOn(hultaforsRepo, 'findOne').mockResolvedValueOnce(testPrduct);

        expect(async () => {
          await service.deleteProduct(testPrduct.articleName);
        }).rejects.toThrow();
      });
    });
  });

  describe('size', () => {
    describe('create', () => {
      it('should create a size', async () => {
        const testSize: Size = {
          size: 42,
          id: 'test',
          status: 1,
          date: 'test',
          product: {
            id: 'test',
            articleName: 'test',
            sizes: [],
            articleNumber: 'test',
          },
        };
        jest.spyOn(sizeRepo, 'findOne').mockResolvedValueOnce(undefined);
        jest.spyOn(sizeRepo, 'create').mockImplementationOnce(() => {
          return testSize;
        });
        jest
          .spyOn(hultaforsRepo, 'findOne')
          .mockResolvedValueOnce(testSize.product);
        jest.spyOn(sizeRepo, 'save').mockResolvedValueOnce(testSize);
        const expected = await service.createSize({
          size: testSize.size,
          status: testSize.status,
          date: testSize.date,
          productName: testSize.product.articleName,
        });
        expect(expected).toEqual(testSize);
      });
      it('should throw error if size already exist', () => {
        const testSize: Size = {
          id: 'test',
          size: 42,
          date: 'test',
          status: 1,
          product: {
            id: 'test',
            articleName: 'test',
            articleNumber: 'test',
            sizes: [],
          },
        };
        jest.spyOn(sizeRepo, 'findOne').mockResolvedValueOnce(testSize);
        expect(
          async () =>
            await service.createSize({
              size: 41,
              productName: 'test',
              date: 'test',
              status: 1,
            }),
        ).rejects.toThrow();
      });

      it('should throw error if size is not created', () => {
        const testSize: Size = {
          id: 'test',
          size: 42,
          date: 'test',
          status: 1,
          product: {
            id: 'test',
            articleName: 'test',
            articleNumber: 'test',
            sizes: [],
          },
        };

        jest.spyOn(sizeRepo, 'findOne').mockResolvedValueOnce(undefined);
        jest.spyOn(sizeRepo, 'create').mockImplementationOnce(() => {
          return undefined;
        });
        jest
          .spyOn(hultaforsRepo, 'findOne')
          .mockResolvedValueOnce(testSize.product);
        jest.spyOn(sizeRepo, 'save').mockResolvedValueOnce(undefined);
        expect(async () => {
          return await service.createSize({
            size: testSize.size,
            status: testSize.status,
            date: testSize.date,
            productName: testSize.product.articleName,
          });
        }).rejects.toThrow();
      });
    });

    describe('edit', () => {
      it('should should edit a size', async () => {
        const testSizeToUpdate: Size = {
          id: 'test',
          size: 32,
          status: 0,
          date: 'tes',
          product: {
            id: 'test',
            articleName: 'test',
            articleNumber: 'test',
            sizes: [],
          },
        };
        const testSize: Size = {
          id: 'test',
          size: 32,
          status: 1,
          date: 'test',
          product: {
            id: 'test',
            articleName: 'test',
            articleNumber: 'test',
            sizes: [],
          },
        };
        jest.spyOn(sizeRepo, 'findOne').mockResolvedValueOnce(testSizeToUpdate);
        jest
          .spyOn(hultaforsRepo, 'findOne')
          .mockResolvedValueOnce(testSizeToUpdate.product);
        jest.spyOn(sizeRepo, 'save').mockResolvedValueOnce(testSize);
        jest.spyOn(sizeRepo, 'findOne').mockResolvedValueOnce(testSize);
        const expected = await service.editSize(
          testSizeToUpdate.size,
          testSizeToUpdate.product.articleName,
          {
            size: testSize.size,
            status: testSize.status,
            productName: testSize.product.articleName,
            date: testSize.date,
          },
        );
        expect(expected).toEqual(testSize);
      });
      it('should throw error if size does not exist', () => {
        jest.spyOn(sizeRepo, 'findOne').mockResolvedValueOnce(undefined);
        jest.spyOn(hultaforsRepo, 'findOne').mockResolvedValueOnce(undefined);
        expect(
          async () =>
            await service.editSize(42, 'test', {
              size: 42,
              date: 'test',
              status: 1,
              productName: 'test',
            }),
        ).rejects.toThrow();
      });
      it('should throw error if size has not been edited', () => {
        const testSize: Size = {
          id: 'test',
          size: 32,
          status: 1,
          date: 'test',
          product: {
            id: 'test',
            articleName: 'test',
            articleNumber: 'test',
            sizes: [],
          },
        };
        jest.spyOn(sizeRepo, 'findOne').mockResolvedValueOnce(testSize);
        jest
          .spyOn(hultaforsRepo, 'findOne')
          .mockResolvedValueOnce(testSize.product);
        jest.spyOn(sizeRepo, 'create').mockImplementationOnce(undefined);
        jest.spyOn(sizeRepo, 'save').mockResolvedValueOnce(undefined);
        expect(
          async () =>
            await service.editSize(
              testSize.size,
              testSize.product.articleName,
              {
                size: testSize.size,
                status: testSize.status,
                productName: testSize.product.articleName,
                date: testSize.date,
              },
            ),
        ).rejects.toThrow();
      });
    });

    describe('delete', () => {
      it('should delete a size', async () => {
        const testSize: Size = {
          id: 'test',
          size: 41,
          status: 1,
          date: 'test',
          product: {
            id: 'test',
            articleName: 'test',
            articleNumber: 'test',
            sizes: [],
          },
        };
        jest.spyOn(sizeRepo, 'findOne').mockResolvedValueOnce(testSize);
        jest.spyOn(sizeRepo, 'remove').mockResolvedValueOnce(testSize);
        jest.spyOn(sizeRepo, 'findOne').mockResolvedValueOnce(undefined);
        const expected = await service.deleteSize({
          size: testSize.size,
          status: testSize.status,
          date: testSize.date,
          productName: testSize.product.articleName,
        });
        expect(expected).toEqual(true);
      });

      it('should throw error if size does not exist', () => {
        jest.spyOn(sizeRepo, 'findOne').mockResolvedValueOnce(undefined);
        expect(
          async () =>
            await service.deleteSize({
              size: 42,
              date: 'test',
              status: 1,
              productName: 'test',
            }),
        ).rejects.toThrow();
      });

      it('should throw error if size has not been deleted', () => {
        const testSize: Size = {
          id: 'test',
          size: 41,
          status: 1,
          date: 'test',
          product: {
            id: 'test',
            articleName: 'test',
            articleNumber: 'test',
            sizes: [],
          },
        };
        jest.spyOn(sizeRepo, 'findOne').mockResolvedValueOnce(testSize);
        jest.spyOn(sizeRepo, 'remove').mockResolvedValueOnce(undefined);
        jest.spyOn(sizeRepo, 'findOne').mockResolvedValueOnce(testSize);
        expect(
          async () =>
            await service.deleteSize({
              size: testSize.size,
              status: testSize.status,
              date: testSize.date,
              productName: testSize.product.articleName,
            }),
        ).rejects.toThrow();
      });
    });
  });
});
