import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export interface UserInfo {
  id: number;
  name: string;
  iat: number;
  exp: number;
}

export const User = createParamDecorator((_, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  if (!request.user) throw new UnauthorizedException();
  return request.user;
});
