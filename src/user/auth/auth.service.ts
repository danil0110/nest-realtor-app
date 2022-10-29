import { ConflictException, Injectable } from '@nestjs/common';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { PrismaService } from 'src/prisma/prisma.service';

interface SignupParams {
  name: string;
  email: string;
  phone: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup({ email, password, name, phone }: SignupParams) {
    const userExists = await this.prismaService.user.findFirst({
      where: { email },
    });

    if (userExists) throw new ConflictException();

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email,
        password: hashed,
        name,
        phone,
        user_type: UserType.BUYER,
      },
    });

    const token = jwt.sign({ name, id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return { token };
  }
}
