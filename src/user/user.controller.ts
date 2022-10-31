import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { User, UserInfo } from './decorators/user.decorator';
import { UserResponseDto } from './dtos/user.dto';
import { UserInterceptor } from './interceptors/user.interceptor';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @UseInterceptors(UserInterceptor)
  getInfoAboutMe(@User() user: UserInfo): Promise<UserResponseDto> {
    return this.userService.getMe(user.id);
  }
}
