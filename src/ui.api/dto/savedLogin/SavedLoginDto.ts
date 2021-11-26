import { LoginTypeEnum } from '../../../core/enums/loginType.enum';

export class SavedLoginDto {
  id: number;
  username: string;
  password: string;
  loginType: LoginTypeEnum;
}
