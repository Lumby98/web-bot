import { LoginTypeEnum } from '../enums/loginType.enum';

export interface SavedLoginModel {
  id: number;
  username: string;
  password: string;
  loginType: LoginTypeEnum;
  salt: string;
  iv: string;
}
