import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../../core/service/user.service';
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
   * finds a user based on there id
   * @param id
   */
  @UseGuards(jwtAuthenticationGuard)
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<UserDto> {
    const u = await this.userService.getById(id);
    return JSON.parse(JSON.stringify(u));
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
