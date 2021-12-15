import { InsertSavedLoginDto } from '../../ui.api/dto/savedLogin/insert-SavedLogin.dto';
import { SavedLoginModel } from '../models/Savedlogin.model';
import { KeyModel } from '../models/key.model';
import { LoginTypeEnum } from '../enums/loginType.enum';
import { SavedLoginDto } from '../../ui.api/dto/savedLogin/SavedLoginDto';
import { InsertKeyDto } from '../../ui.api/dto/savedLogin/insert-Key.dto';

export const savedLoginServiceInterfaceProvider =
  'savedLoginServiceInterfaceProvider';
export interface savedLoginServiceInterface {
  insertLogin(
    insertSavedLoginDto: InsertSavedLoginDto,
  ): Promise<SavedLoginModel>;

  getKey(): Promise<KeyModel>;

  changeKey(inserKeyDto: InsertKeyDto);

  encryptLogin(
    insertSavedLoginDto: InsertSavedLoginDto,
  ): Promise<SavedLoginModel>;

  decryptLogin(
    savedlogin: SavedLoginModel,
    key: string,
  ): Promise<SavedLoginDto>;

  verifyKey(key: string);

  getLogin(loginType: LoginTypeEnum, key: string): Promise<SavedLoginDto>;

  findAllLogins(key: string): Promise<SavedLoginDto[]>;
}
