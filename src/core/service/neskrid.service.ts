import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NeskridModel } from '../models/neskrid.model';
import { NeskridProduct } from '../../infrastructure/entities/neskrid.product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NeskridService {
  constructor(
    @InjectRepository(NeskridProduct)
    private productRepository: Repository<NeskridProduct>,
  ) {}

  /**
   *  creates a new product in the database
   * @param productToCreate
   */
  async create(productToCreate: NeskridModel): Promise<NeskridModel> {
    try {
      //checks if the product already exists
      const check = await this.productRepository.findOne({
        brand: productToCreate.brand,
        articleName: productToCreate.articleName,
      });

      if (check) {
        throw new HttpException('product already exists', HttpStatus.FOUND);
      }
      //makes sure the the active variable is either 1 or 0 defaults to 1
      if (productToCreate.active > 1 || productToCreate.active < 0) {
        productToCreate.active = 1;
      }
      //creates and returns the product
      let product: NeskridProduct = this.productRepository.create();
      product.brand = productToCreate.brand;
      product.articleName = productToCreate.articleName;
      product.articleNo = productToCreate.articleNo;
      product.active = productToCreate.active;
      product = await this.productRepository.save(product);
      return JSON.parse(JSON.stringify(product));
    } catch (err) {
      throw err;
    }
  }

  /**
   * finds all the products in the database
   */
  async findAll(): Promise<NeskridModel[]> {
    try {
      const productE: NeskridProduct[] = await this.productRepository.find();
      if (productE) {
        console.log(productE);
        return JSON.parse(JSON.stringify(productE));
      }
    } catch (err) {
      throw new HttpException(
        'could not find any products',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * finds one product based on the brand and article name
   * @param articleName
   * @param brand
   */
  async findOne(brand: string, articleName: string): Promise<NeskridModel> {
    try {
      const product: NeskridProduct = await this.productRepository.findOne({
        brand: brand,
        articleName: articleName,
      });

      if (product) {
        return JSON.parse(JSON.stringify(product));
      } else {
        throw new HttpException(
          'could not find the product',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * updates a product
   * @param productToUpdate
   */
  async update(productToUpdate: NeskridModel): Promise<NeskridModel> {
    try {
      //find the object to update
      const productTU: NeskridProduct = await this.productRepository.findOne({
        brand: productToUpdate.brand,
        articleName: productToUpdate.articleName,
      });
      if (productTU) {
        await this.productRepository.update(productTU.id, productToUpdate);
        const updatedProduct = await this.productRepository.findOne({
          articleName: productToUpdate.articleName,
        });

        if (updatedProduct) {
          return JSON.parse(JSON.stringify(updatedProduct));
        } else {
          throw new HttpException(
            'This product was not updated',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        throw new HttpException(
          'this product does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (err) {
      throw err;
    }
  }
}
