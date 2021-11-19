import { InsertSavedLoginDto } from '../../ui.api/dto/savedLogin/insert-SavedLogin.dto';
import { SavedLoginModel } from '../models/Savedlogin.model';
import { KeyModel } from '../models/key.model';

export const savedLoginServiceInterfaceProvider =
  'savedLoginServiceInterfaceProvider';
export interface savedLoginServiceInterface {
  insertLogin(
    insertSavedLoginDto: InsertSavedLoginDto,
  ): Promise<SavedLoginModel>;

  getKey(): Promise<KeyModel>;

  EncryptLogin(
    insertSavedLoginDto: InsertSavedLoginDto,
  ): Promise<SavedLoginModel>;

  findAllLogins(keyModel: KeyModel): Promise<SavedLoginModel>;
}
