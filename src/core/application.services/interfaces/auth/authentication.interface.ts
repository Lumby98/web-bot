import { RegisterDto } from '../../../../ui.api/dto/authentication/register.dto';
import { UserDto } from '../../../../ui.api/dto/user/user.dto';

export const authenticationInterfaceProvider =
  'authenticationInterfaceProvider';

export interface AuthenticationInterface {
  register(registrationData: RegisterDto): Promise<UserDto>;

  getAuthenticatedUser(
    username: string,
    plainTextPassword: string,
  ): Promise<UserDto>;

  verifyPassword(plainTextPassword: string, hashedPassword: string);

  getCookieWithJwtToken(userId: number);

  getCookieForLogOut();
}
