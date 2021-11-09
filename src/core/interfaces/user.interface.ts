import { CreateUserDto } from '../../api/dto/user/create-user.dto';
import { UserModel } from '../models/user.model';
import { EditUserDto } from '../../api/dto/user/edit-user.dot';

export interface UserInterface {
  create(createUserDto: CreateUserDto): Promise<UserModel>;

  getByUsername(username: string): Promise<UserModel>;

  findAll(): Promise<UserModel[]>;

  getById(id: number): Promise<UserModel>;

  update(username: string, editUser: EditUserDto): Promise<UserModel>;

  remove(username: string);
}
