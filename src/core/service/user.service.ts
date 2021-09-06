import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../api/dto/user/create-user.dto';
import { UpdateUserDto } from '../../api/dto/user/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../infrastructure/entities/user.entity';
import { Repository } from 'typeorm';
import { UserModel } from '../models/user.model';
import { EditUserDto } from '../../api/dto/user/edit-user.dot';
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserModel> {
    try {
      if (createUserDto.admin < 0 || createUserDto.admin > 1) {
        throw Error();
      }
      const newUser = await this.userRepository.create(createUserDto);
      await this.userRepository.save(newUser);
      return JSON.parse(JSON.stringify(newUser));
    } catch (err) {
      throw new HttpException('could not create user', HttpStatus.BAD_REQUEST);
    }
  }

  async getByUsername(username: string): Promise<UserModel> {
    try {
      const user = await this.userRepository.findOne({ username });
      if (user) {
        return JSON.parse(JSON.stringify(user));
      }
      throw new HttpException(
        'User with this username does not exist',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async findAll(): Promise<UserModel[]> {
    try {
      const users = await this.userRepository.find();
      if (users) {
        return JSON.parse(JSON.stringify(users));
      }
      throw new HttpException('Could not retrive users', HttpStatus.NOT_FOUND);
    } catch (err) {
      throw err;
    }
  }

  async getById(id: number): Promise<UserModel> {
    try {
      const user = await this.userRepository.findOne({ id });
      if (user) {
        return JSON.parse(JSON.stringify(user));
      }
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async update(username: string, editUser: EditUserDto): Promise<UserModel> {
    try {
      const userTU: User = await this.userRepository.findOne({
        username: username,
      });
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
      throw new HttpException(
        'The user was not updated',
        HttpStatus.BAD_REQUEST,
      );
    } catch (err) {
      throw err;
    }
  }

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
        }
      }
      throw new HttpException(
        'could not find user to delete',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }
}
