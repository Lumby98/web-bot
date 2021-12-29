import { LoginDto } from '../../../ui.api/dto/user/login.dto';

export const loginDtoStub = (): LoginDto => {
  return {
    username: 'username1',
    password: 'password1',
  };
};
