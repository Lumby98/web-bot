import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../infrastructure/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      if (createUserDto.admin < 0 || createUserDto.admin > 1) {
        throw Error();
      }
      const newUser = await this.userRepository.create(createUserDto);
      await this.userRepository.save(newUser);
      return newUser;
    } catch (err) {
      throw new HttpException('could not create user', HttpStatus.BAD_REQUEST);
    }
  }

  async getByUsername(username: string) {
    try {
      const user = await this.userRepository.findOne({ username });
      if (user) {
        return user;
      }
      throw new HttpException(
        'User with this username does not exist',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async getById(id: number) {
    try {
      const user = await this.userRepository.findOne({ id });
      if (user) {
        return user;
      }
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  update(username: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${username} user`;
  }

  async remove(username: string) {
    try {
      const deleteUser = await this.userRepository.findOne({
        username: username,
      });
      if (deleteUser) {
        await this.userRepository.delete(deleteUser);
        return true;
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
