import { User } from '../../../infrastructure/entities/user.entity';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: User;
}
