import {
  ConflictException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { PrismaService } from '../../prisma/prisma.service';

interface SignupParams {
  name: string;
  email: string;
  phone: string;
  password: string;
  productKey?: string;
  userType: UserType;
}

interface SigninParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup({
    email,
    password,
    name,
    phone,
    productKey,
    userType,
  }: SignupParams) {
    if (userType !== UserType.BUYER) {
      if (!productKey) throw new UnauthorizedException();

      const key = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
      const isKeyMatches = await bcrypt.compare(key, productKey);

      if (!isKeyMatches) throw new UnauthorizedException();
    }

    const userExists = await this.prismaService.user.findFirst({
      where: { email },
    });

    if (userExists) throw new ConflictException();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        userType: userType,
      },
    });

    const token = await this.generateJWT({
      id: user.id,
      name: user.name,
    });

    return { token };
  }

  async signin({ email, password }: SigninParams) {
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user) throw new HttpException('Invalid credentials', 400);

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) throw new HttpException('Invalid credentials', 400);

    const token = await this.generateJWT({
      id: user.id,
      name: user.name,
    });

    return { token };
  }

  async generateProductKey(email: string, userType: UserType) {
    const str = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
    return await bcrypt.hash(str, 10);
  }

  private generateJWT<T extends object>(payload: T) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  }
}
