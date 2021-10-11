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

  /**
   * creates a product
   * @param product
   */
  async createProduct(product: HultaforsModel): Promise<HultaforsModel> {
    try {
      //checks if the product already exists
      const doesProductExist = await this.productRepository.findOne({
        where: { articleName: product.articleName },
      });

      //throw error if product exists
      if (doesProductExist) {
        throw new Error('Product already exists');
      }

      //creates the size for the product
      const sizes: Size[] = [];
      for (const size of product.sizes) {
        const newSize = await this.sizeRepository.create();
        newSize.size = size.size;
        newSize.status = size.status;
        newSize.date = size.date;
        await this.sizeRepository.save(newSize);
        sizes.push(newSize);
      }

      //creates the product along with the relation to the created sizes
      const productEntity = await this.productRepository.create();
      productEntity.articleName = product.articleName;
      productEntity.articleNumber = product.articleNumber;
      productEntity.sizes = sizes;
      await this.productRepository.save(productEntity);
      return JSON.parse(JSON.stringify(productEntity));
    } catch (e) {
      if (e.message == 'Product already exists') {
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
      //finds the product that needs to be update
      console.log('first find');
      const productToEdit = await this.productRepository.findOne({
        where: { articleName: product.articleName },
        relations: ['sizes'],
      });

      //if product cannot be found throw error
      if (!productToEdit) {
        throw new Error('Product does not exist');
      }

      //update product and its sizes
      console.log('update');
      productToEdit.articleName = product.articleName;
      productToEdit.articleNumber = product.articleNumber;
      await this.productRepository.save(productToEdit);
      for (const size of product.sizes) {
        await this.editSize(size.size, product.articleName, size);
      }
      //finds the product to ensure it has been updated
      console.log('second find');
      const changedProduct = await this.productRepository.findOne({
        where: { articleName: product.articleName },
        relations: ['sizes'],
      });

      //if product is found return it otherwise throw error
      if (changedProduct) {
        return JSON.parse(JSON.stringify(changedProduct));
      }
      throw new Error('Failed to update product');
    } catch (e) {
      if (e.message == 'Product does not exist') {
        throw e;
      } else {
        throw new Error('Failed to update Product');
      }
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
      if (e.message == 'Could not find product to delete') {
        throw e;
      } else {
        throw new Error('failed to delete product');
      }
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
      if (e.message == 'Size already exist') {
        throw e;
      } else {
        throw new Error('failed to create size');
      }
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
      console.log('size find');
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
      console.log('size update');
      await this.sizeRepository.save({
        id: sizeToUpdate.id,
        ...size,
      });

      console.log('second size find');
      const isUpdated = this.sizeRepository.findOne({
        where: { id: sizeToUpdate.id },
      });

      if (isUpdated) {
        return JSON.parse(JSON.stringify(isUpdated));
      }
      throw new Error('could not update size');
    } catch (e) {
      if (e.message == 'Could not find size to edit') {
        throw e;
      } else {
        throw new Error('failed to update size');
      }
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
      if (e.message == 'Could not find size to delete') {
        throw e;
      } else {
        throw new Error('Could not delete product');
      }
    }
  }
}
