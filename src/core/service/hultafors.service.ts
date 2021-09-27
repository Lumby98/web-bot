import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HultaforsProduct } from '../../infrastructure/entities/hultafors.product.entity';
import { Repository } from 'typeorm';
import { Size } from '../../infrastructure/entities/size.entity';
import { HultaforsModel } from '../models/hultafors.model';
import { SizeModel } from '../models/size.model';

@Injectable()
export class HultaforsService {
  constructor(
    @InjectRepository(HultaforsProduct)
    private productRepository: Repository<HultaforsProduct>,
    @InjectRepository(Size)
    private sizeRepository: Repository<Size>,
  ) {}

  /**
   * finds all products with sizes
   */
  async findAllProducts(): Promise<HultaforsModel[]> {
    try {
      const products = await this.productRepository.find({
        relations: ['sizes'],
      });
      return JSON.parse(JSON.stringify(products));
    } catch (e) {
      throw new Error('Could not find products from Hultafors');
    }
  }

  /**
   * finds one product by articleName
   * @param articleName
   */
  async findProductByArticleName(articleName: string): Promise<HultaforsModel> {
    try {
      const product = await this.productRepository.findOne({
        where: { articleName: articleName },
        relations: ['sizes'],
      });
      return JSON.parse(JSON.stringify(product));
    } catch (e) {
      throw new Error('Could not find product');
    }
  }

  async createProduct(product: HultaforsModel): Promise<HultaforsModel> {
    try {
      const doesProductExist = await this.productRepository.findOne({
        where: { articleName: product.articleName },
      });

      if (doesProductExist) {
        throw new Error('Product already exists');
      }

      const sizes: Size[] = [];
      for (const size of product.sizes) {
        const newSize = await this.sizeRepository.create();
        newSize.size = size.size;
        newSize.status = size.status;
        newSize.date = size.date;
        await this.sizeRepository.save(newSize);
        sizes.push(newSize);
      }

      const productEntity = await this.productRepository.create();
      productEntity.articleName = product.articleName;
      productEntity.articleNumber = product.articleNumber;
      productEntity.sizes = sizes;
      await this.productRepository.save(productEntity);
      return JSON.parse(JSON.stringify(productEntity));
    } catch (e) {
      if (e.message) {
        throw e;
      } else {
        throw new Error('could not create product');
      }
    }
  }

  /**
   * edits a product
   * @param articleName
   * @param product
   */
  async editProduct(
    articleName: string,
    product: HultaforsModel,
  ): Promise<HultaforsModel> {
    try {
      const productToEdit = await this.productRepository.findOne({
        where: { articleName: articleName },
        relations: ['sizes'],
      });

      if (!productToEdit) {
        throw new Error('Product does not exist');
      }

      await this.productRepository.update({ id: productToEdit.id }, product);
      for (const size of product.sizes) {
        const s = await this.editSize(size.size, product.articleName, size);
        console.log(s);
      }

      const changedProduct = await this.productRepository.findOne({
        where: { articleName: product.articleName },
        relations: ['sizes'],
      });

      if (changedProduct) {
        return JSON.parse(JSON.stringify(changedProduct));
      }
      throw new Error('Failed to update product');
    } catch (e) {
      throw e;
    }
  }

  /**
   * deletes a product
   * @param articleName
   */
  async deleteProduct(articleName: string): Promise<boolean> {
    try {
      const productToDelete = await this.productRepository.findOne({
        where: { articleName: articleName },
      });

      if (!productToDelete) {
        throw new Error('Could not find product to delete');
      }
      await this.productRepository.remove(productToDelete);

      const isDeleted = await this.productRepository.findOne({
        where: { articleName: articleName },
      });

      if (isDeleted) {
        throw new Error('Could not delete product');
      }
      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * creates a size
   * @param size
   */
  async createSize(size: SizeModel): Promise<SizeModel> {
    try {
      const doesExist = await this.sizeRepository.findOne({
        where: { size: size.size, product: size.productName },
      });

      if (doesExist) {
        throw new Error('Size already exist');
      }

      const newSize = await this.sizeRepository.create();
      newSize.size = size.size;
      newSize.status = size.status;
      newSize.date = size.date;
      newSize.product = await this.productRepository.findOne({
        where: { articleName: size.productName },
      });
      await this.sizeRepository.save(newSize);
      return JSON.parse(JSON.stringify(newSize));
    } catch (e) {
      throw e;
    }
  }

  /**
   * edits a size based of their id
   * @param sizeNumber
   * @param productName
   * @param size
   */
  async editSize(
    sizeNumber: number,
    productName: string,
    size: SizeModel,
  ): Promise<SizeModel> {
    try {
      const sizeToUpdate = await this.sizeRepository.findOne({
        where: {
          size: sizeNumber,
          product: this.productRepository.findOne({
            where: { articleName: productName },
          }),
        },
      });

      if (!sizeToUpdate) {
        throw new Error('Could not find size to edit');
      }

      await this.sizeRepository.update(sizeToUpdate.id, size);

      const isUpdated = this.sizeRepository.findOne({
        where: { id: sizeToUpdate.id },
      });

      if (isUpdated) {
        return JSON.parse(JSON.stringify(isUpdated));
      }
      throw new Error('could not update size');
    } catch (e) {
      throw e;
    }
  }

  /**
   * deletes a size
   * @param size
   */
  async deleteSize(size: SizeModel): Promise<boolean> {
    try {
      const sizeToDelete = await this.sizeRepository.findOne({
        where: { size: size.size, product: size.productName },
      });

      if (!sizeToDelete) {
        throw new Error('Could not find size to delete');
      }
      await this.sizeRepository.remove(sizeToDelete);

      const isDeleted = await this.sizeRepository.findOne({
        where: { size: size.size, product: size.productName },
      });

      if (isDeleted) {
        throw new Error('Could not delete product');
      }
      return true;
    } catch (e) {
      throw e;
    }
  }
}
