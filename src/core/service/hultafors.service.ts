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
      const sizes: Size[] = JSON.parse(JSON.stringify(product.sizes));
      const productEntity = await this.productRepository.create();
      productEntity.articleName = product.articleName;
      productEntity.articleNumber = product.articleNumber;
      productEntity.sizes = sizes; // dont know if this works yet
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
      newSize.product = await this.productRepository.findOne({
        where: { articleName: size.productName },
      });
      await this.sizeRepository.save(newSize);
      return JSON.parse(JSON.stringify(newSize));
    } catch (e) {
      throw e;
    }
  }

  async editSize(sizeID: number, size: SizeModel): Promise<SizeModel> {
    try {
      const sizeToUpdate = await this.sizeRepository.findOne({
        where: { id: sizeID },
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
