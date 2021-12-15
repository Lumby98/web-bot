import { HultaforsModel } from '../../../models/hultafors.model';
import { SizeModel } from '../../../models/size.model';

export const hultaforsInterfaceProvider = 'hultaforsInterfaceProvider';

export interface HultaforsInterface {
  findAllProducts(): Promise<HultaforsModel[]>;

  findProductByArticleName(articleName: string): Promise<HultaforsModel>;

  createProduct(product: HultaforsModel): Promise<HultaforsModel>;

  editProduct(
    articleName: string,
    product: HultaforsModel,
  ): Promise<HultaforsModel>;

  deleteProduct(articleName: string): Promise<boolean>;

  createSize(size: SizeModel): Promise<SizeModel>;

  editSize(
    sizeNumber: number,
    productName: string,
    size: SizeModel,
  ): Promise<SizeModel>;

  deleteSize(size: SizeModel): Promise<boolean>;
}
