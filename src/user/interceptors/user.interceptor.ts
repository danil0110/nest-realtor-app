import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';

export class UserInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split('Bearer ')[1];
    const user = await jwt.decode(token);
    console.log(user);

    return next.handle();
  }
}
