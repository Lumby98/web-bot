import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../../../ui.api/dto/user/create-user.dto';
import { UpdateUserDto } from '../../../../ui.api/dto/user/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../../infrastructure/entities/user.entity';
import { Repository } from 'typeorm';
import { UserModel } from '../../../models/user.model';
import { EditUserDto } from '../../../../ui.api/dto/user/edit-user.dot';
import * as bcrypt from 'bcrypt';
import { UserInterface } from '../../interfaces/auth/user.interface';

@Injectable()
export class UserService implements UserInterface {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * create a new user
   * @param createUserDto
   */
  async create(createUserDto: CreateUserDto): Promise<UserModel> {
    try {
      if (createUserDto.admin < 0 || createUserDto.admin > 1) {
        throw Error();
      }
      const newUser = await this.userRepository.create(createUserDto);
      await this.userRepository.save(newUser);
      return JSON.parse(JSON.stringify(newUser));
    } catch (err) {
      throw new Error('could not create user');
    }
  }

  /**
   * find a user based on username
   * @param username
   */
  async getByUsername(username: string): Promise<UserModel> {
    try {
      const user = await this.userRepository.findOne({ username });
      if (user) {
        return JSON.parse(JSON.stringify(user));
      }
      throw new Error('User with this username does not exist');
    } catch (err) {
      throw err;
    }
  }

  /**
   * find all users
   */
  async findAll(): Promise<UserModel[]> {
    try {
      const users = await this.userRepository.find();
      if (users) {
        return JSON.parse(JSON.stringify(users));
      }
      throw new Error('Could not retrive users');
    } catch (err) {
      throw err;
    }
  }

  /**
   * find user by id
   * @param id
   */
  async getById(id: number): Promise<UserModel> {
    try {
      const user = await this.userRepository.findOne({ id });
      if (user) {
        return JSON.parse(JSON.stringify(user));
      }
      throw new Error('User with this id does not exist');
    } catch (err) {
      throw err;
    }
  }

  /**
   * update user
   * @param username
   * @param editUser
   */
  async update(username: string, editUser: EditUserDto): Promise<UserModel> {
    try {
      console.log(username);
      const userTU: User = await this.userRepository.findOne({
        username: username,
      });
      const sameEmail: User = await this.userRepository.findOne({
        username: editUser.username,
      });
      if (sameEmail) {
        if (sameEmail.username != username) {
          throw new Error('username is already taken');
        }
      }
      let hashedPassword: string;
      if (userTU) {
        if (editUser.password == undefined) {
          hashedPassword = userTU.password;
        } else {
          hashedPassword = await bcrypt.hash(editUser.password, 10);
        }

        const updateUser: UpdateUserDto = {
          username: editUser.username,
          password: hashedPassword,
          admin: editUser.admin,
        };

        await this.userRepository.update({ id: userTU.id }, updateUser);
        const updatedUser = await this.userRepository.findOne({
          username: updateUser.username,
        });
        if (updatedUser) {
          updatedUser.password = undefined;
          return JSON.parse(JSON.stringify(updatedUser));
        }
      }
      throw new Error('The user was not updated');
    } catch (err) {
      throw err;
    }
  }

  /**
   * remove user
   * @param username
   */
  async remove(username: string) {
    try {
      const userToDelete = await this.userRepository.findOne({
        username: username,
      });
      if (userToDelete) {
        await this.userRepository.remove(userToDelete);

        const deletedUser = await this.userRepository.findOne({
          username: username,
        });
        if (!deletedUser) {
          return true;
        } else {
          throw new Error();
        }
      }
      throw new Error('could not find user to delete');
    } catch (err) {
      throw err;
    }
  }
}
