import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponseDto } from './dtos/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMe(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    return new UserResponseDto(user);
  }
}
