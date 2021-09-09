import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../../core/service/user.service';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { jwtAuthenticationGuard } from '../guard/jwt-authentication.guard';
import { UserDto } from '../dto/user/user.dto';
import { EditUserDto } from '../dto/user/edit-user.dot';

@UseGuards(jwtAuthenticationGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * gets all users
   */
  @UseGuards(jwtAuthenticationGuard)
  @Get()
  async findAll() {
    const userModels = await this.userService.findAll();
    const userDtos: UserDto[] = userModels.map((user) => ({
      id: user.id,
      username: user.username,
      admin: user.admin,
    }));
    return userDtos;
  }

  /**
   * finds a user based on there username
   * @param username
   */
  @UseGuards(jwtAuthenticationGuard)
  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.userService.getByUsername(username);
  }

  /**
   * updates a user
   * @param username
   * @param editUser
   */
  @UseGuards(jwtAuthenticationGuard)
  @Patch(':username')
  update(@Param('username') username: string, @Body() editUser: EditUserDto) {
    return this.userService.update(username, editUser);
  }

  /**
   * deletes a user
   * @param username
   */
  @UseGuards(jwtAuthenticationGuard)
  @Delete(':username')
  remove(@Param('username') username: string) {
    return this.userService.remove(username);
  }
}
