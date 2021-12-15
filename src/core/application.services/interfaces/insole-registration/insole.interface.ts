import { RegisterInsoleDto } from '../../../../ui.api/dto/insole-upload/register-insole.dto';

export const insoleInterfaceProvider = 'insoleInterfaceProvider';

export interface InsoleInterface {
  registerInsole(insoleDto: RegisterInsoleDto);
}
