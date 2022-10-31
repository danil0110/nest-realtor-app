import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseEnumPipe,
  Post,
} from '@nestjs/common';
import { UserType } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { GenerateProductKeyDto, SigninDto, SignupDto } from '../dtos/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/:userType')
  signup(
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
    @Body() body: SignupDto,
  ) {
    return this.authService.signup({ ...body, userType });
  }

  @Post('signin')
  @HttpCode(200)
  signin(@Body() body: SigninDto) {
    return this.authService.signin(body);
  }

  @Roles(UserType.ADMIN)
  @Post('key')
  generateProductKey(@Body() { email, userType }: GenerateProductKeyDto) {
    return this.authService.generateProductKey(email, userType);
  }
}
