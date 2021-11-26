import { LoginTypeEnum } from '../../../core/enums/loginType.enum';

export class InsertSavedLoginDto {
  username: string;
  password: string;
  loginType: LoginTypeEnum;
  key: string;
}
