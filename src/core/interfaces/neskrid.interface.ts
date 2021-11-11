import { NeskridModel } from '../models/neskrid.model';

export const neskridInterfaceProvider = 'neskridInterfaceProvider';

export interface NeskridInterface {
  create(productToCreate: NeskridModel): Promise<NeskridModel>;

  createAll(productsToCreate: NeskridModel[]): Promise<NeskridModel[]>;

  findAll(): Promise<NeskridModel[]>;

  findOne(brand: string, articleName: string): Promise<NeskridModel>;

  update(productToUpdate: NeskridModel): Promise<NeskridModel>;

  updateAll(productsToUpdate: NeskridModel[]): Promise<NeskridModel[]>;
}
